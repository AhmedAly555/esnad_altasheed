import { $$ } from "../lib/dom.js";
import { prefersReducedMotion } from "../lib/env.js";
import { onceVisible } from "../lib/observe.js";

const REVEALABLE = "[data-reveal], [data-lines], [data-reveal-trigger]";
const OBSERVER_OPTIONS = { rootMargin: "0px 0px -8% 0px", threshold: 0.12 };
const MAX_STAGGER_STEPS = 5;

function show(element, batchIndex) {
  element.style.setProperty("--i", Math.min(batchIndex, MAX_STAGGER_STEPS));
  element.classList.add("is-visible");
  element.dispatchEvent(new CustomEvent("reveal"));

  if (element.hasAttribute("data-reveal")) {
    element.addEventListener(
      "transitionend",
      (event) => {
        if (event.target === element) element.classList.add("is-done");
      },
      { once: true },
    );
  }
}

/** Reveals elements as they scroll into view. Everything is shown at once under reduced motion. */
export function init() {
  const elements = $$(REVEALABLE);
  if (!elements.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  onceVisible(elements, show, OBSERVER_OPTIONS);
}
