import { promises as fs } from "node:fs";
import path from "node:path";
import { CSS, DIST } from "./paths.mjs";
import { readText } from "./fs-utils.mjs";

// Source order is the cascade order: tokens, base, layout, components. Page styles bundle separately.
const SITE_ORDER = ["tokens.css", "base", "layout", "components"];

const sortedCss = async (dir) =>
  (await fs.readdir(dir))
    .filter((name) => name.endsWith(".css"))
    .sort()
    .map((name) => path.join(dir, name));

async function concat(files) {
  const parts = await Promise.all(files.map(readText));
  return parts.map((css) => css.trim()).join("\n\n") + "\n";
}

async function write(relative, css) {
  const target = path.join(DIST, "css", relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, css);
}

export async function bundleCss() {
  const siteFiles = [];
  for (const entry of SITE_ORDER) {
    const full = path.join(CSS, entry);
    if ((await fs.stat(full)).isDirectory()) siteFiles.push(...(await sortedCss(full)));
    else siteFiles.push(full);
  }
  await write("site.css", await concat(siteFiles));
  await write("fonts.css", await readText(path.join(CSS, "fonts.css")));

  // A page is either one file (pages/name.css) or a folder of files (pages/name/*.css) bundled into one
  const pagesDir = path.join(CSS, "pages");
  for (const entry of await fs.readdir(pagesDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      await write(`pages/${entry.name}.css`, await concat(await sortedCss(path.join(pagesDir, entry.name))));
    } else if (entry.name.endsWith(".css")) {
      await write(`pages/${entry.name}`, await readText(path.join(pagesDir, entry.name)));
    }
  }
}
