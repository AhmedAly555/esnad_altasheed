import path from "node:path";
import { DIST } from "./paths.mjs";
import { exists, readText, walk } from "./fs-utils.mjs";

const isLocal = (url) => url && !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

async function resolvesLocally(fromFile, url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean) return true;
  let target = path.resolve(path.dirname(fromFile), decodeURI(clean));
  if (clean.endsWith("/")) target = path.join(target, "index.html");
  return exists(target);
}

async function checkHtml(file, rel, problems) {
  const html = await readText(file);
  const seen = new Set();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
    if (seen.has(match[1])) problems.push(`${rel}: duplicate id "${match[1]}"`);
    seen.add(match[1]);
  }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${rel}: needs exactly one <h1>`);
  for (const match of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    if (isLocal(match[1]) && !(await resolvesLocally(file, match[1])))
      problems.push(`${rel}: missing file "${match[1]}"`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt=/.test(match[0])) problems.push(`${rel}: <img> without alt`);
  }
}

async function checkCss(file, rel, problems) {
  const css = await readText(file);
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (isLocal(match[1]) && !(await resolvesLocally(file, match[1])))
      problems.push(`${rel}: missing file "${match[1]}"`);
  }
}

/** Checks the built output: unique ids, one h1, no missing files, alt on every image. */
export async function validate() {
  const problems = [];
  for (const file of await walk(DIST)) {
    const rel = path.relative(DIST, file).replace(/\\/g, "/");
    if (file.endsWith(".html")) await checkHtml(file, rel, problems);
    else if (file.endsWith(".css")) await checkCss(file, rel, problems);
  }
  return problems;
}
