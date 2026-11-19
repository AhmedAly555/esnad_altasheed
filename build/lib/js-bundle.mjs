import { promises as fs } from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { JS } from "./paths.mjs";
import { isDevOnly } from "./dev-only.mjs";
import { walk } from "./fs-utils.mjs";

const PAGES_PREFIX = "pages/";

const isEntry = (relative) =>
  relative === "main.js" || (relative.startsWith(PAGES_PREFIX) && !isDevOnly(relative.slice(PAGES_PREFIX.length)));

const relativeToJs = (file) => path.relative(JS, file).split(path.sep).join("/");

/**
 * Development copies the ES modules untouched. Production bundles every entry (main.js, pages/*.js) into one
 * minified classic script at the same path, so pages need no module support and the site runs from file://.
 */
export async function bundleJs(outDir, { dev = false } = {}) {
  const target = path.join(outDir, "js");
  if (dev) {
    await fs.cp(JS, target, { recursive: true });
    return;
  }
  const entryPoints = (await walk(JS)).filter((file) => isEntry(relativeToJs(file)));
  await build({
    entryPoints,
    outdir: target,
    outbase: JS,
    bundle: true,
    format: "iife",
    target: "es2020",
    minify: true,
    legalComments: "none",
    logLevel: "warning",
  });
}
