import path from "node:path";

// Pages that exist for the team only. Each one owns src/pages/<name>/, css/pages/<name>/ and js/pages/<name>.js,
// and none of them may reach a production build.
export const DEV_ONLY_PAGES = ["styleguide"];

const normalize = (relative) => relative.split(path.sep).join("/");

/** True for any path (relative to src/pages, css/pages or js/pages) that belongs to a dev-only page. */
export function isDevOnly(relative) {
  const [first] = normalize(relative).split("/");
  return DEV_ONLY_PAGES.includes(first.replace(/\.(css|js|html)$/, ""));
}

/** Output paths (relative to dist/) that prove a dev-only page was built. */
export const devOnlyOutputs = () =>
  DEV_ONLY_PAGES.flatMap((name) => [`${name}/index.html`, `css/pages/${name}.css`, `js/pages/${name}.js`]);
