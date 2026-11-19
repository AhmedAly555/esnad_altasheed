import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const STATIC_DIRS = ["css", "js", "assets"];

const DEFAULTS = {
  lang: "ar",
  dir: "rtl",
  robots: "index, follow",
  description: "",
  css: "",
  scripts: "",
};

const readText = (file) => fs.readFile(file, "utf8");

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(match[0].length) };
}

const partialCache = new Map();
async function loadPartial(name) {
  if (!partialCache.has(name)) {
    partialCache.set(name, await readText(path.join(SRC, "partials", `${name}.html`)));
  }
  return partialCache.get(name);
}

const lookup = (ctx, key) => key.split(".").reduce((o, k) => (o == null ? o : o[k]), ctx);

const RAW_KEYS = new Set(["content", "pageCss", "pageScripts", "attrs"]);
const escapeHtml = (v) =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const output = (key, value) => (RAW_KEYS.has(key.split(".").pop()) ? String(value) : escapeHtml(value));

const readJson = async (file) => JSON.parse(await readText(path.join(ROOT, "content", file)));

// {{> partial key="value"}} includes a partial with local args; {{ key }} is strict (missing = error)
// {{#each list}}...{{/each}} repeats its body per item, exposed as {{ item.field }}
async function render(template, ctx, from) {
  template = template.replace(/\{\{#each\s+([\w.-]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, inner) => {
    const list = lookup(ctx, key);
    if (!Array.isArray(list)) throw new Error(`#each "${key}" is not a list in ${from}`);
    return list
      .map((item) =>
        inner.replace(/\{\{\s*item\.([\w.-]+)\s*\}\}/g, (__, field) => {
          const value = lookup(item, field);
          if (value === undefined) throw new Error(`Missing "item.${field}" in #each ${key} (${from})`);
          return output(field, value);
        }),
      )
      .join("");
  });

  const includeRe = /\{\{>\s*([\w-]+)((?:\s+[\w-]+="[^"]*")*)\s*\}\}/g;
  let result = "";
  let last = 0;
  for (const m of template.matchAll(includeRe)) {
    result += template.slice(last, m.index);
    const args = {};
    for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) args[a[1]] = a[2];
    const partial = await loadPartial(m[1]);
    result += await render(partial, { ...ctx, ...args }, `partial ${m[1]}`);
    last = m.index + m[0].length;
  }
  result += template.slice(last);

  return result.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
    const value = lookup(ctx, key);
    if (value === undefined) throw new Error(`Missing value "${key}" in ${from}`);
    return output(key, value);
  });
}

const tags = {
  css: (root, list) =>
    list.map((f) => `<link rel="stylesheet" href="${root}css/${f}.css">`).join("\n  "),
  scripts: (root, list) =>
    list.map((f) => `<script src="${root}js/${f}.js" defer></script>`).join("\n  "),
};
const csv = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

async function buildPages() {
  const site = await readJson("site.config.json");
  const navItems = await readJson("nav.json");
  const layout = await readText(path.join(SRC, "templates", "base.html"));
  const pagesDir = path.join(SRC, "pages");
  const pages = (await walk(pagesDir)).filter((f) => f.endsWith(".html"));
  const written = [];

  for (const file of pages) {
    const rel = path.relative(pagesDir, file);
    const { meta, body } = parseFrontMatter(await readText(file));
    const outRel = rel.replace(/\\/g, "/");
    const depth = outRel.split("/").length - 1;
    const root = depth === 0 ? "./" : "../".repeat(depth);

    const ctx = {
      ...DEFAULTS,
      ...meta,
      site,
      root,
      path: "/" + outRel.replace(/index\.html$/, ""),
      year: new Date().getFullYear(),
      header: meta.header || "solid",
      description: meta.description || site.company.descriptionAr,
      nav: navItems.map((n) => ({ ...n, attrs: n.key === meta.nav ? ' aria-current="page"' : "" })),
      pageCss: tags.css(root, csv(meta.css)),
      pageScripts: tags.scripts(root, csv(meta.scripts)),
    };
    if (!meta.title) throw new Error(`${outRel}: front matter needs a title`);

    ctx.content = await render(body, ctx, outRel);
    const html = await render(layout, ctx, "templates/base.html");

    const target = path.join(DIST, rel);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, html);
    written.push(outRel);
  }
  return written;
}

async function copyStatic() {
  for (const dir of STATIC_DIRS) {
    const from = path.join(ROOT, dir);
    try {
      await fs.cp(from, path.join(DIST, dir), { recursive: true });
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
}

const isLocal = (url) => url && !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function resolveTarget(fromFile, url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean) return true;
  let target = path.resolve(path.dirname(fromFile), decodeURI(clean));
  if (clean.endsWith("/")) target = path.join(target, "index.html");
  return exists(target);
}

async function validate() {
  const problems = [];
  const files = await walk(DIST);

  for (const file of files) {
    const rel = path.relative(DIST, file).replace(/\\/g, "/");
    if (rel.startsWith("assets/") && !file.endsWith(".html")) continue;

    if (file.endsWith(".html")) {
      const html = await readText(file);
      const seen = new Set();
      for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
        if (seen.has(m[1])) problems.push(`${rel}: duplicate id "${m[1]}"`);
        seen.add(m[1]);
      }
      if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${rel}: needs exactly one <h1>`);
      for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
        if (isLocal(m[1]) && !(await resolveTarget(file, m[1]))) problems.push(`${rel}: missing file "${m[1]}"`);
      }
      for (const m of html.matchAll(/<img\b[^>]*>/g)) {
        if (!/\salt=/.test(m[0])) problems.push(`${rel}: <img> without alt`);
      }
    } else if (file.endsWith(".css")) {
      const css = await readText(file);
      for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
        if (isLocal(m[1]) && !m[1].startsWith("data:") && !(await resolveTarget(file, m[1]))) {
          problems.push(`${rel}: missing file "${m[1]}"`);
        }
      }
    }
  }
  return problems;
}

export async function build() {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  const pages = await buildPages();
  await copyStatic();
  const problems = await validate();
  return { pages, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { pages, problems } = await build();
    console.log(`Built ${pages.length} page(s) into dist/`);
    if (problems.length) {
      console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
