import { $$ } from "../lib/dom.js";

const INDEX_FILE = "index.html";
const FOLDER_LINK = /^([^:?#]*\/)([?#].*)?$/;

/**
 * Opened from disk, a link to a folder lists its files instead of loading its index page.
 * Pages are linked as clean folder URLs for servers, so on file:// they get the index file appended.
 */
export function init() {
  if (location.protocol !== "file:") return;
  $$("a[href]").forEach((link) => {
    const match = link.getAttribute("href").match(FOLDER_LINK);
    if (match) link.setAttribute("href", `${match[1]}${INDEX_FILE}${match[2] ?? ""}`);
  });
}
