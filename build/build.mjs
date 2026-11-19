import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DIST, ROOT, STAGING } from "./lib/paths.mjs";
import { loadContent } from "./lib/content.mjs";
import { buildPages } from "./lib/pages.mjs";
import { bundleCss } from "./lib/css-bundle.mjs";
import { validate } from "./lib/validate.mjs";
import { isDevOnly } from "./lib/dev-only.mjs";

// CSS is bundled, not copied, so it is not listed here
const STATIC_DIRS = ["js", "assets"];

async function copyStatic(outDir, { dev }) {
  const includeInDist = (source) => {
    const relative = path.relative(path.join(ROOT, "js", "pages"), source);
    return dev || relative.startsWith("..") || !isDevOnly(relative);
  };
  for (const dir of STATIC_DIRS) {
    await fs.cp(path.join(ROOT, dir), path.join(outDir, dir), { recursive: true, filter: includeInDist });
  }
}

/** The previous dist/ stays untouched until the new one is complete and valid. */
async function swapIntoDist() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.rename(STAGING, DIST);
}

/**
 * Production by default. dev: true adds the pages listed in lib/dev-only.mjs (the styleguide).
 * Builds into a staging folder; dist/ is replaced only when nothing threw and validation found no problems.
 * Returns { pages, problems, swapped }.
 */
export async function build({ dev = false } = {}) {
  await fs.rm(STAGING, { recursive: true, force: true });
  await fs.mkdir(STAGING, { recursive: true });
  try {
    const pages = await buildPages(await loadContent(), STAGING, { dev });
    await bundleCss(STAGING, { dev });
    await copyStatic(STAGING, { dev });
    const problems = await validate(STAGING);
    if (problems.length) return { pages, problems, swapped: false };
    await swapIntoDist();
    return { pages, problems, swapped: true };
  } finally {
    await fs.rm(STAGING, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { pages, problems, swapped } = await build({ dev: process.argv.includes("--dev") });
    if (problems.length) {
      console.error(`\n${problems.length} problem(s), dist/ was not updated:\n- ${problems.join("\n- ")}`);
      process.exit(1);
    }
    console.log(`Built ${pages.length} page(s) into dist/${swapped ? "" : " (unchanged)"}`);
  } catch (error) {
    console.error(`Build failed, dist/ was not updated: ${error.message}`);
    process.exit(1);
  }
}
