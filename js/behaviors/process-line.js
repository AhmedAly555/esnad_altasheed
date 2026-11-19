import { $, $$ } from "../lib/dom.js";
import { prefersReducedMotion, wideViewport } from "../lib/env.js";
import { onScrollFrame } from "../lib/scroll.js";

const START_AT = 0.75; // the line starts drawing when the list top passes 75% of the viewport height
const TRAVEL_PADDING = 0.3; // extra viewport heights of scroll before the line is complete
const REACHED_TOLERANCE = 0.001;

/** Extends the gold connector with scroll (--progress) and lights each step marker when it is reached. */
export function init() {
  const list = $("[data-process]");
  if (!list) return;

  const steps = $$(".step", list);
  if (prefersReducedMotion()) {
    list.style.setProperty("--progress", 1);
    steps.forEach((step) => step.classList.add("is-reached"));
    return;
  }

  const wide = wideViewport();

  // Position of a step along the line, 0 at the start and 1 at the end, in the current layout
  const stepOffset = (step, listRect) => {
    const rect = step.getBoundingClientRect();
    if (!wide.matches) return (rect.top - listRect.top) / listRect.height;
    const rtl = getComputedStyle(list).direction === "rtl";
    return rtl ? (listRect.right - rect.right) / listRect.width : (rect.left - listRect.left) / listRect.width;
  };

  onScrollFrame(() => {
    const viewport = window.innerHeight;
    const listRect = list.getBoundingClientRect();
    const raw = (viewport * START_AT - listRect.top) / (listRect.height + viewport * TRAVEL_PADDING);
    const progress = Math.min(Math.max(raw, 0), 1);

    list.style.setProperty("--progress", progress.toFixed(4));
    steps.forEach((step) => {
      step.classList.toggle("is-reached", progress > stepOffset(step, listRect) + REACHED_TOLERANCE);
    });
  });
}
