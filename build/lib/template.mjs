import path from "node:path";
import { SRC } from "./paths.mjs";
import { readText } from "./fs-utils.mjs";

// Template syntax:
//   {{ key }}                      value from the context; missing is an error; escaped unless the key is raw
//   {{> partial a="x" b=data.key}} include src/partials/partial.html; a quoted arg is text, a bare arg is a context value
//   {{#each list}}..{{/each}}      render the body once per item, with the item as {{ item }} / {{ item.field }}.
//                                  The body may include partials, which also see `item`.
const RAW_KEYS = new Set(["content", "pageCss", "pageScripts", "attrs"]);
const INCLUDE = /\{\{>\s*([\w-]+)((?:\s+[\w-]+=(?:"[^"]*"|[\w.-]+))*)\s*\}\}/g;
const ARG = /([\w-]+)=(?:"([^"]*)"|([\w.-]+))/g;
const EACH = /\{\{#each\s+([\w.-]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g;
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

async function replaceAsync(text, pattern, replacer) {
  let result = "";
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    result += text.slice(last, match.index) + (await replacer(match));
    last = match.index + match[0].length;
  }
  return result + text.slice(last);
}

function parseArgs(raw, ctx, from) {
  const args = {};
  for (const [, name, text, ref] of raw.matchAll(ARG)) {
    args[name] = text ?? lookup(ctx, ref);
    if (args[name] === undefined) throw new Error(`Missing value "${ref}" for arg "${name}" in ${from}`);
  }
  return args;
}

const expandEach = (template, ctx, from) =>
  replaceAsync(template, EACH, async ([, key, body]) => {
    const list = lookup(ctx, key);
    if (!Array.isArray(list)) throw new Error(`#each "${key}" is not a list in ${from}`);
    const rendered = [];
    for (const item of list) rendered.push(await render(body, { ...ctx, item }, `#each ${key} in ${from}`));
    return rendered.join("");
  });

const expandIncludes = (template, ctx, from) =>
  replaceAsync(template, INCLUDE, async ([, name, rawArgs]) =>
    render(await loadPartial(name), { ...ctx, ...parseArgs(rawArgs, ctx, from) }, `partial ${name}`),
  );

export async function render(template, ctx, from) {
  const expanded = await expandIncludes(await expandEach(template, ctx, from), ctx, from);
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
