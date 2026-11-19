import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DIST, ROOT } from "./lib/paths.mjs";
import { loadContent } from "./lib/content.mjs";
import { buildPages } from "./lib/pages.mjs";
import { bundleCss } from "./lib/css-bundle.mjs";
import { validate } from "./lib/validate.mjs";
import { isDevOnly } from "./lib/dev-only.mjs";

// CSS is bundled, not copied, so it is not listed here
const STATIC_DIRS = ["js", "assets"];

async function copyStatic({ dev }) {
  const includeInDist = (source) => {
    const relative = path.relative(path.join(ROOT, "js", "pages"), source);
    return dev || relative.startsWith("..") || !isDevOnly(relative);
  };
  for (const dir of STATIC_DIRS) {
    await fs.cp(path.join(ROOT, dir), path.join(DIST, dir), { recursive: true, filter: includeInDist });
  }
}

/** Production by default. dev: true adds the pages listed in lib/dev-only.mjs (the styleguide). */
export async function build({ dev = false } = {}) {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  const pages = await buildPages(await loadContent(), { dev });
  await bundleCss({ dev });
  await copyStatic({ dev });
  return { pages, problems: await validate() };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { pages, problems } = await build({ dev: process.argv.includes("--dev") });
    console.log(`Built ${pages.length} page(s) into dist/`);
    if (problems.length) {
      console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
