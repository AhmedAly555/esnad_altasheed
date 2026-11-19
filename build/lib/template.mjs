import path from "node:path";
import { SRC } from "./paths.mjs";
import { readText } from "./fs-utils.mjs";

// Template syntax:
//   {{ key }}                    value from the context; missing is an error; escaped unless the key is raw
//   {{> partial a="x" b="y"}}    include src/partials/partial.html with local args
//   {{#each list}}..{{/each}}    repeat the body per item, fields read as {{ item.field }}
const RAW_KEYS = new Set(["content", "pageCss", "pageScripts", "attrs"]);
const INCLUDE = /\{\{>\s*([\w-]+)((?:\s+[\w-]+="[^"]*")*)\s*\}\}/g;
const EACH = /\{\{#each\s+([\w.-]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g;
const ITEM_FIELD = /\{\{\s*item\.([\w.-]+)\s*\}\}/g;
const VALUE = /\{\{\s*([\w.-]+)\s*\}\}/g;

const partials = new Map();
const lookup = (ctx, key) => key.split(".").reduce((node, part) => (node == null ? node : node[part]), ctx);
const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const output = (key, value) => (RAW_KEYS.has(key.split(".").pop()) ? String(value) : escapeHtml(value));

async function loadPartial(name) {
  if (!partials.has(name)) partials.set(name, await readText(path.join(SRC, "partials", `${name}.html`)));
  return partials.get(name);
}

function expandEach(template, ctx, from) {
  return template.replace(EACH, (_, key, body) => {
    const list = lookup(ctx, key);
    if (!Array.isArray(list)) throw new Error(`#each "${key}" is not a list in ${from}`);
    return list
      .map((item) =>
        body.replace(ITEM_FIELD, (__, field) => {
          const value = lookup(item, field);
          if (value === undefined) throw new Error(`Missing "item.${field}" in #each ${key} (${from})`);
          return output(field, value);
        }),
      )
      .join("");
  });
}

async function expandIncludes(template, ctx) {
  let result = "";
  let last = 0;
  for (const match of template.matchAll(INCLUDE)) {
    result += template.slice(last, match.index);
    const args = Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((arg) => [arg[1], arg[2]]));
    result += await render(await loadPartial(match[1]), { ...ctx, ...args }, `partial ${match[1]}`);
    last = match.index + match[0].length;
  }
  return result + template.slice(last);
}

export async function render(template, ctx, from) {
  const expanded = await expandIncludes(expandEach(template, ctx, from), ctx);
  return expanded.replace(VALUE, (_, key) => {
    const value = lookup(ctx, key);
    if (value === undefined) throw new Error(`Missing value "${key}" in ${from}`);
    return output(key, value);
  });
}

export function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { meta, body: raw.slice(match[0].length) };
}
