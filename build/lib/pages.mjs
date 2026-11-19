import { promises as fs } from "node:fs";
import path from "node:path";
import { SRC } from "./paths.mjs";
import { readText, walk } from "./fs-utils.mjs";
import { parseFrontMatter, render } from "./template.mjs";
import { isDevOnly } from "./dev-only.mjs";

const DEFAULTS = {
  lang: "ar",
  dir: "rtl",
  robots: "index, follow",
  description: "",
  css: "",
  scripts: "",
  header: "solid",
};

const TITLE_SEPARATOR = " | ";

const csv = (value) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
const cssTags = (root, names) =>
  names.map((name) => `<link rel="stylesheet" href="${root}css/${name}.css">`).join("\n  ");
const scriptTags = (root, names) =>
  names.map((name) => `<script type="module" src="${root}js/${name}.js"></script>`).join("\n  ");

/** Title and description: from the list entry (collection pages), front matter, or the page's data file "meta". */
function pageMeta({ meta, content, outRel, entry }) {
  const pageData = meta.data ? content[meta.data]?.meta : null;
  const title = entry
    ? `${entry.title}${TITLE_SEPARATOR}${content.site.company.nameAr}`
    : meta.title || pageData?.title;
  if (!title) throw new Error(`${outRel}: needs a title (front matter, or "meta" in its data file)`);
  const description = entry?.description || meta.description || pageData?.description;
  return { title, description: description || content.site.company.descriptionAr };
}

function pageContext({ meta, content, outRel, entry }) {
  const depth = outRel.split("/").length - 1;
  const root = depth === 0 ? "./" : "../".repeat(depth);

  return {
    ...DEFAULTS,
    ...meta,
    ...content,
    ...(entry && { [meta.as]: entry }),
    ...pageMeta({ meta, content, outRel, entry }),
    root,
    path: "/" + outRel.replace(/index\.html$/, ""),
    year: new Date().getFullYear(),
    nav: content.nav.map((item) => ({ ...item, attrs: item.key === meta.nav ? ' aria-current="page"' : "" })),
    pageCss: cssTags(root, csv(meta.css)),
    pageScripts: scriptTags(root, csv(meta.scripts)),
  };
}

/** A collection page (front matter: collection, as, param) is one template rendered once per list item. */
function pageJobs(rel, meta, content) {
  const outRel = rel.replace(/\\/g, "/");
  if (!meta.collection) return [{ outRel }];
  const items = meta.collection.split(".").reduce((node, key) => node[key], content);
  const folder = path.posix.dirname(outRel);
  return items.map((entry) => ({ outRel: `${folder}/${entry[meta.param]}/index.html`, entry }));
}

/** Renders every src/pages/**.html through the base template into dist/. Returns the written paths. */
export async function buildPages(content, outDir, { dev = false } = {}) {
  const layout = await readText(path.join(SRC, "templates", "base.html"));
  const pagesDir = path.join(SRC, "pages");
  const written = [];

  for (const file of (await walk(pagesDir)).filter((name) => name.endsWith(".html"))) {
    if (!dev && isDevOnly(path.relative(pagesDir, file))) continue;
    const { meta, body } = parseFrontMatter(await readText(file));
    for (const { outRel, entry } of pageJobs(path.relative(pagesDir, file), meta, content)) {
      const ctx = pageContext({ meta, content, outRel, entry });
      ctx.content = await render(body, ctx, outRel);
      const html = await render(layout, ctx, "templates/base.html");

      const target = path.join(outDir, outRel);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, html);
      written.push(outRel);
    }
  }
  return written;
}
