import path from "node:path";
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

const metaContent = (html, selector) => html.match(new RegExp(`<meta ${selector} content="([^"]*)"`))?.[1];

/** Every page needs its own title and description; a duplicate is reported against the page that repeats it. */
function checkSeo(html, rel, problems, seen) {
  const title = html.match(/<title>([^<]+)<[/]title>/)?.[1];
  const description = metaContent(html, 'name="description"');
  if (!title) problems.push(`${rel}: missing <title>`);
  if (!description) problems.push(`${rel}: missing meta description`);
  if (!/<link rel="canonical" href="https?:[/][/]/.test(html)) problems.push(`${rel}: missing absolute canonical`);
  if (!metaContent(html, 'property="og:image"')) problems.push(`${rel}: missing og:image`);
  for (const [kind, value] of [
    ["title", title],
    ["description", description],
  ]) {
    if (!value) continue;
    const key = `${kind}:${value}`;
    if (seen.has(key)) problems.push(`${rel}: same ${kind} as ${seen.get(key)}`);
    else seen.set(key, rel);
  }
}

async function checkHtml(file, rel, problems, metaSeen) {
  const html = await readText(file);
  checkSeo(html, rel, problems, metaSeen);
  const ids = new Set();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
    if (ids.has(match[1])) problems.push(`${rel}: duplicate id "${match[1]}"`);
    ids.add(match[1]);
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

/** Checks the built output: unique ids, one h1, no missing files or anchors, alt on every image, and a unique title and description per page. */
export async function validate(outDir) {
  const problems = [];
  const seen = new Map();
  for (const file of await walk(outDir)) {
    const rel = path.relative(outDir, file).replace(/\\/g, "/");
    if (file.endsWith(".html")) await checkHtml(file, rel, problems, seen);
    else if (file.endsWith(".css")) await checkCss(file, rel, problems);
  }
  return problems;
}
