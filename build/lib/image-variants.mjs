import path from "node:path";
import { ROOT } from "./paths.mjs";
import { walk } from "./fs-utils.mjs";

// The small copy of each photo that phones and thumbnails download instead of the full-size file
export const SMALL_WIDTH = 800;
export const SMALL_SUFFIX = `-${SMALL_WIDTH}`;

export const smallVariantOf = (source) => source.replace(/\.webp$/, `${SMALL_SUFFIX}.webp`);
export const isSmallVariant = (file) => file.endsWith(`${SMALL_SUFFIX}.webp`);

const toPosix = (file) => file.split(path.sep).join("/");

/** Site-relative paths (assets/...) of every small variant that exists on disk. */
export async function listSmallVariants() {
  const files = await walk(path.join(ROOT, "assets"));
  return new Set(files.filter(isSmallVariant).map((file) => toPosix(path.relative(ROOT, file))));
}

const IMG_WITH_SIZES = /<img\b[^>]*\ssizes="[^"]*"[^>]*>/g;
const SRC = /\ssrc="((?:\.\/|(?:\.\.\/)+)(assets\/[^"]+\.webp))"/;
const WIDTH = /\swidth="(\d+)"/;

/**
 * Adds srcset to every <img> that declares sizes and has a small variant on disk.
 * Templates only write src and sizes, so the variant naming lives here and nowhere else.
 */
export function addSrcset(html, variants) {
  return html.replace(IMG_WITH_SIZES, (tag) => {
    const src = tag.match(SRC);
    const width = tag.match(WIDTH);
    if (!src || !width || Number(width[1]) <= SMALL_WIDTH || !variants.has(smallVariantOf(src[2]))) return tag;
    const srcset = `${smallVariantOf(src[1])} ${SMALL_WIDTH}w, ${src[1]} ${width[1]}w`;
    return tag.replace(SRC, `${src[0]} srcset="${srcset}"`);
  });
}
