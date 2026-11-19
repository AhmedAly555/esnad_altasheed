import { $ } from "../lib/dom.js";
import { cssNumber, prefersReducedMotion } from "../lib/env.js";
import { onScrollFrame } from "../lib/scroll.js";

const RATIO_FALLBACK = 0.12;

/** Moves the hero image slowly against the scroll. It only ever reacts to scrolling. */
export function init() {
  const image = $("[data-parallax]");
  const hero = image && image.closest(".hero");
  if (!hero || prefersReducedMotion()) return;

  const ratio = cssNumber("--parallax-ratio", RATIO_FALLBACK);
  onScrollFrame(() => {
    const { top, bottom } = hero.getBoundingClientRect();
    if (bottom > 0) image.style.setProperty("--py", `${Math.round(-top * ratio)}px`);
  });
}
