import { $, $$ } from "../lib/dom.js";

const OPEN_CLASS = "is-lightbox-open";
const COUNTER_SEPARATOR = " / ";

/**
 * Gallery viewer on a native <dialog>: focus is trapped and Escape closes it by default.
 * Arrow keys move between images, and focus returns to the thumbnail that opened it.
 * Without dialog support the thumbnails stay plain links to the full image.
 */
export function init() {
  const dialog = $("[data-lightbox]");
  const items = $$("[data-lightbox-item]");
  if (!dialog || !items.length || typeof dialog.showModal !== "function") return;

  const image = $("[data-lightbox-image]", dialog);
  const caption = $("[data-lightbox-caption]", dialog);
  const counter = $("[data-lightbox-count]", dialog);
  const isRtl = () => getComputedStyle(dialog).direction === "rtl";
  let index = 0;

  function show(position) {
    index = (position + items.length) % items.length;
    const thumbnail = $("img", items[index]);
    image.src = items[index].href;
    image.alt = thumbnail.alt;
    image.width = thumbnail.width;
    image.height = thumbnail.height;
    caption.textContent = thumbnail.alt;
    counter.textContent = `${index + 1}${COUNTER_SEPARATOR}${items.length}`;
  }

  items.forEach((item, position) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      show(position);
      document.documentElement.classList.add(OPEN_CLASS);
      dialog.showModal();
    });
  });

  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove(OPEN_CLASS);
    items[index].focus();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest("[data-lightbox-close]")) dialog.close();
    else if (event.target.closest("[data-lightbox-next]")) show(index + 1);
    else if (event.target.closest("[data-lightbox-previous]")) show(index - 1);
  });

  dialog.addEventListener("keydown", (event) => {
    const forwardKey = isRtl() ? "ArrowLeft" : "ArrowRight";
    const backKey = isRtl() ? "ArrowRight" : "ArrowLeft";
    if (event.key === forwardKey) show(index + 1);
    else if (event.key === backKey) show(index - 1);
  });
}
