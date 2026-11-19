import { $, $$ } from "../lib/dom.js";
import { wideViewport } from "../lib/env.js";

const FOCUSABLE = "a[href], button:not([disabled])";

/** Mobile menu: aria-expanded toggle, focus trap, Escape to close, inert page behind the panel. */
export function init() {
  const header = $("[data-header]");
  const toggle = header && $("[data-menu-toggle]", header);
  const panel = header && $("[data-menu-panel]", header);
  if (!toggle || !panel) return;

  const root = document.documentElement;
  const behindMenu = [$("#main"), $(".site-footer")].filter(Boolean);
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", toggle.dataset[open ? "labelClose" : "labelOpen"]);
    header.classList.toggle("is-menu-open", open);
    root.classList.toggle("is-menu-open", open);
    behindMenu.forEach((el) => {
      el.inert = open;
    });
  }

  function trapFocus(event) {
    const items = [toggle, ...$$(FOCUSABLE, panel)];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  toggle.addEventListener("click", () => {
    const open = !isOpen();
    setOpen(open);
    if (open) $("a[href]", panel).focus();
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      setOpen(false);
      toggle.focus();
    } else if (event.key === "Tab") {
      trapFocus(event);
    }
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest("a[href]")) setOpen(false);
  });

  wideViewport().addEventListener("change", (event) => {
    if (event.matches && isOpen()) setOpen(false);
  });
}
