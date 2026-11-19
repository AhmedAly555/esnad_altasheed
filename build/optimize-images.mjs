import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CONTENT, ROOT } from "./lib/paths.mjs";
import { readText, walk } from "./lib/fs-utils.mjs";
import { SMALL_WIDTH, isSmallVariant, smallVariantOf } from "./lib/image-variants.mjs";

// Re-encodes the photos in assets/ in place and rewrites the width/height recorded in content/*.json.
// Idempotent: a file that already fits the budget is left alone, so re-running never degrades it further.
const PHOTO_DIRS = ["pic", "id-"];
const MAX_EDGE = 1600;
const QUALITY = 72;
const EFFORT = 5;
const BYTES_PER_PIXEL_BUDGET = 0.2;
const ASSETS = path.join(ROOT, "assets");

const isPhoto = (relative) =>
  relative.endsWith(".webp") && !isSmallVariant(relative) && PHOTO_DIRS.some((dir) => relative.startsWith(dir));
const relativeToAssets = (file) => path.relative(ASSETS, file).split(path.sep).join("/");

async function optimize(file) {
  // Read into memory first: on Windows sharp keeps a path open and blocks overwriting it
  const source = await fs.readFile(file);
  const before = source.length;
  const { width, height } = await sharp(source).metadata();
  const needsResize = Math.max(width, height) > MAX_EDGE;
  if (!needsResize && before / (width * height) <= BYTES_PER_PIXEL_BUDGET)
    return { width, height, before, after: before };

  const buffer = await sharp(source)
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: EFFORT })
    .toBuffer({ resolveWithObject: true });
  if (!needsResize && buffer.data.length >= before) return { width, height, before, after: before };
  await fs.writeFile(file, buffer.data);
  return { width: buffer.info.width, height: buffer.info.height, before, after: buffer.data.length };
}

/** Walks every JSON object: a { src, width, height } image or a project's mainImage with imageWidth/imageHeight. */
function syncDimensions(node, sizes) {
  if (Array.isArray(node)) return node.some((item) => syncDimensions(item, sizes));
  if (!node || typeof node !== "object") return false;
  let changed = false;
  const set = (key, value) => {
    if (node[key] !== value) {
      node[key] = value;
      changed = true;
    }
  };
  const apply = (source, widthKey, heightKey) => {
    const size = sizes.get(source);
    if (!size) return;
    set(widthKey, size.width);
    set(heightKey, size.height);
  };
  if (typeof node.src === "string" && "width" in node) apply(node.src, "width", "height");
  if (typeof node.mainImage === "string") apply(node.mainImage, "imageWidth", "imageHeight");
  return Object.values(node).reduce((any, child) => syncDimensions(child, sizes) || any, changed);
}

/** The small copy is regenerated whenever the full-size photo is newer than it (or it does not exist yet). */
async function writeSmallVariant(file) {
  const target = smallVariantOf(file);
  const stale = await fs.stat(target).then(
    async (variant) => variant.mtimeMs < (await fs.stat(file)).mtimeMs,
    () => true,
  );
  if (!stale) return;
  const source = await fs.readFile(file);
  const { width } = await sharp(source).metadata();
  if (width <= SMALL_WIDTH) return;
  await sharp(source).resize({ width: SMALL_WIDTH }).webp({ quality: QUALITY, effort: EFFORT }).toFile(target);
}

const sizes = new Map();
let totalBefore = 0;
let totalAfter = 0;
for (const file of (await walk(ASSETS)).filter((name) => isPhoto(relativeToAssets(name)))) {
  const result = await optimize(file);
  await writeSmallVariant(file);
  sizes.set(`assets/${relativeToAssets(file)}`, result);
  totalBefore += result.before;
  totalAfter += result.after;
}

for (const name of (await fs.readdir(CONTENT)).filter((file) => file.endsWith(".json"))) {
  const target = path.join(CONTENT, name);
  const data = JSON.parse(await readText(target));
  if (syncDimensions(data, sizes)) await fs.writeFile(target, JSON.stringify(data, null, 2) + "\n");
}

const megabytes = (bytes) => (bytes / 1024 / 1024).toFixed(1);
console.log(`Photos: ${megabytes(totalBefore)} MB -> ${megabytes(totalAfter)} MB (${sizes.size} files)`);
