(() => {
  const header = document.querySelector("[data-header]");
  const toggle = header && header.querySelector("[data-menu-toggle]");
  if (!header || !toggle) return;

  const panel = header.querySelector("[data-menu-panel]");
  const sentinel = document.querySelector("[data-header-sentinel]");
  const root = document.documentElement;
  const desktop = window.matchMedia("(min-width: 64em)");
  const behindMenu = [document.getElementById("main"), document.querySelector(".site-footer")].filter(Boolean);
  const FOCUSABLE = "a[href], button:not([disabled])";

  if (sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    }).observe(sentinel);
  }

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", toggle.dataset[open ? "labelClose" : "labelOpen"]);
    header.classList.toggle("is-menu-open", open);
    root.classList.toggle("menu-open", open);
    behindMenu.forEach((el) => {
      el.inert = open;
    });
  }

  function trapFocus(event) {
    const items = [toggle, ...panel.querySelectorAll(FOCUSABLE)];
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
    if (open) panel.querySelector("a[href]").focus();
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

  desktop.addEventListener("change", (event) => {
    if (event.matches && isOpen()) setOpen(false);
  });
})();
