import { promises as fs } from "node:fs";
import path from "node:path";
import { transform } from "esbuild";
import { CSS } from "./paths.mjs";
import { readText } from "./fs-utils.mjs";
import { isDevOnly } from "./dev-only.mjs";

// Source order is the cascade order: fonts, tokens, base, layout, components. Fonts ride along to save a blocking request. Page styles bundle separately.
const SITE_ORDER = ["fonts.css", "tokens.css", "base", "layout", "components"];

const sortedCss = async (dir) =>
  (await fs.readdir(dir))
    .filter((name) => name.endsWith(".css"))
    .sort()
    .map((name) => path.join(dir, name));

async function concat(files) {
  const parts = await Promise.all(files.map(readText));
  return parts.map((css) => css.trim()).join("\n\n") + "\n";
}

/** Production CSS is minified; development keeps the source readable in the browser tools. */
async function write(outDir, relative, css, { dev }) {
  const target = path.join(outDir, "css", relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, dev ? css : (await transform(css, { loader: "css", minify: true })).code);
}

export async function bundleCss(outDir, { dev = false } = {}) {
  const siteFiles = [];
  for (const entry of SITE_ORDER) {
    const full = path.join(CSS, entry);
    if ((await fs.stat(full)).isDirectory()) siteFiles.push(...(await sortedCss(full)));
    else siteFiles.push(full);
  }
  await write(outDir, "site.css", await concat(siteFiles), { dev });

  // A page is either one file (pages/name.css) or a folder of files (pages/name/*.css) bundled into one
  const pagesDir = path.join(CSS, "pages");
  for (const entry of await fs.readdir(pagesDir, { withFileTypes: true })) {
    if (!dev && isDevOnly(entry.name)) continue;
    if (entry.isDirectory()) {
      await write(outDir, `pages/${entry.name}.css`, await concat(await sortedCss(path.join(pagesDir, entry.name))), {
        dev,
      });
    } else if (entry.name.endsWith(".css")) {
      await write(outDir, `pages/${entry.name}`, await readText(path.join(pagesDir, entry.name)), { dev });
    }
  }
}
