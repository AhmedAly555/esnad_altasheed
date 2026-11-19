import { $$ } from "../lib/dom.js";
import { animate } from "../lib/ease.js";
import { cssNumber, prefersReducedMotion } from "../lib/env.js";

const INTEGER = /^\d[\d,]*$/;
const COUNT_FALLBACK_MS = 1600;

/** Counts [data-count] figures up once, when their [data-reveal-trigger] ancestor is revealed. */
export function init() {
  if (prefersReducedMotion()) return;

  $$("[data-count]").forEach((figure) => {
    const finalText = figure.textContent.trim();
    const trigger = figure.closest("[data-reveal-trigger]");
    if (!trigger || !INTEGER.test(finalText)) return;

    // Screen readers get the final value up front; the animated copy is hidden from them
    const reader = document.createElement("span");
    reader.className = "visually-hidden";
    reader.textContent = finalText;
    figure.before(reader);
    figure.setAttribute("aria-hidden", "true");

    // Lock the width so the layout does not shift while digits are added
    figure.style.display = "inline-block";
    figure.style.minInlineSize = `${figure.getBoundingClientRect().width}px`;
    figure.style.textAlign = "start";

    const target = Number(finalText.replace(/,/g, ""));
    const format = (n) => (finalText.includes(",") ? n.toLocaleString("en-US") : String(n));
    figure.textContent = format(0);

    trigger.addEventListener(
      "reveal",
      () => {
        animate(cssNumber("--dur-count", COUNT_FALLBACK_MS), (progress) => {
          figure.textContent = format(Math.round(target * progress));
        });
      },
      { once: true },
    );
  });
}
