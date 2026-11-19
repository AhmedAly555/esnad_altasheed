import path from "node:path";
import { DIST } from "./paths.mjs";
import { exists, readText, walk } from "./fs-utils.mjs";

const isLocal = (url) => url && !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

function targetFile(fromFile, url) {
  const clean = url.split("#")[0].split("?")[0];
  const target = path.resolve(path.dirname(fromFile), decodeURI(clean));
  return clean.endsWith("/") ? path.join(target, "index.html") : target;
}

async function resolvesLocally(fromFile, url) {
  return !url.split("#")[0].split("?")[0] || exists(targetFile(fromFile, url));
}

/** A link such as services/#finishing must land on an id that exists in the target page. */
async function fragmentExists(fromFile, url) {
  const fragment = url.split("#")[1];
  if (!fragment || !targetFile(fromFile, url).endsWith(".html")) return true;
  return (await readText(targetFile(fromFile, url))).includes(`id="${fragment}"`);
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
    if (!isLocal(match[1])) continue;
    if (!(await resolvesLocally(file, match[1]))) problems.push(`${rel}: missing file "${match[1]}"`);
    else if (!(await fragmentExists(file, match[1]))) problems.push(`${rel}: missing anchor "${match[1]}"`);
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

/** Checks the built output: unique ids, one h1, no missing files or anchors, alt on every image. */
export async function validate() {
  const problems = [];
  for (const file of await walk(DIST)) {
    const rel = path.relative(DIST, file).replace(/\\/g, "/");
    if (file.endsWith(".html")) await checkHtml(file, rel, problems);
    else if (file.endsWith(".css")) await checkCss(file, rel, problems);
  }
  return problems;
}
