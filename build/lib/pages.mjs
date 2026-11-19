import { promises as fs } from "node:fs";
import path from "node:path";
import { DIST, SRC } from "./paths.mjs";
import { readText, walk } from "./fs-utils.mjs";
import { parseFrontMatter, render } from "./template.mjs";

const DEFAULTS = {
  lang: "ar",
  dir: "rtl",
  robots: "index, follow",
  description: "",
  css: "",
  scripts: "",
  header: "solid",
};

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

function pageContext({ meta, content, outRel }) {
  const depth = outRel.split("/").length - 1;
  const root = depth === 0 ? "./" : "../".repeat(depth);
  const pageData = meta.data ? content[meta.data]?.meta : null;
  const title = meta.title || pageData?.title;
  if (!title) throw new Error(`${outRel}: needs a title (front matter, or "meta" in its data file)`);

  return {
    ...DEFAULTS,
    ...meta,
    ...content,
    title,
    root,
    path: "/" + outRel.replace(/index\.html$/, ""),
    year: new Date().getFullYear(),
    description: meta.description || pageData?.description || content.site.company.descriptionAr,
    nav: content.nav.map((item) => ({ ...item, attrs: item.key === meta.nav ? ' aria-current="page"' : "" })),
    pageCss: cssTags(root, csv(meta.css)),
    pageScripts: scriptTags(root, csv(meta.scripts)),
  };
}

/** Renders every src/pages/**.html through the base template into dist/. Returns the written paths. */
export async function buildPages(content) {
  const layout = await readText(path.join(SRC, "templates", "base.html"));
  const pagesDir = path.join(SRC, "pages");
  const written = [];

  for (const file of (await walk(pagesDir)).filter((name) => name.endsWith(".html"))) {
    const rel = path.relative(pagesDir, file);
    const outRel = rel.replace(/\\/g, "/");
    const { meta, body } = parseFrontMatter(await readText(file));
    const ctx = pageContext({ meta, content, outRel });

    ctx.content = await render(body, ctx, outRel);
    const html = await render(layout, ctx, "templates/base.html");

    const target = path.join(DIST, rel);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, html);
    written.push(outRel);
  }
  return written;
}
