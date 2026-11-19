import { $ } from "../lib/dom.js";
import { watchVisibility } from "../lib/observe.js";

/** Marks the header as scrolled once the sentinel at the top of the page leaves the viewport. */
export function init() {
  const header = $("[data-header]");
  const sentinel = $("[data-header-sentinel]");
  if (!header || !sentinel || !("IntersectionObserver" in window)) return;

  watchVisibility(sentinel, (visible) => header.classList.toggle("is-scrolled", !visible));
}
