import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DIST, ROOT } from "./lib/paths.mjs";
import { loadContent } from "./lib/content.mjs";
import { buildPages } from "./lib/pages.mjs";
import { bundleCss } from "./lib/css-bundle.mjs";
import { validate } from "./lib/validate.mjs";

// CSS is bundled, not copied, so it is not listed here
const STATIC_DIRS = ["js", "assets"];

async function copyStatic() {
  for (const dir of STATIC_DIRS) {
    await fs.cp(path.join(ROOT, dir), path.join(DIST, dir), { recursive: true });
  }
}

export async function build() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  const pages = await buildPages(await loadContent());
  await bundleCss();
  await copyStatic();
  return { pages, problems: await validate() };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { pages, problems } = await build();
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
