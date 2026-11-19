import { $$ } from "../lib/dom.js";
import { prefersReducedMotion, whenFontLoaded } from "../lib/env.js";

const makeSpan = (className) => {
  const span = document.createElement("span");
  span.className = className;
  return span;
};

/** Measures which words share a rendered line, then rebuilds the heading as one masked block per line. */
function splitIntoLines(heading) {
  const text = heading.dataset.text || heading.textContent.trim().replace(/\s+/g, " ");
  heading.dataset.text = text;
  heading.setAttribute("aria-label", text);
  heading.textContent = "";

  const words = text.split(" ").map((word, index, all) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    heading.append(span);
    if (index < all.length - 1) heading.append(" ");
    return span;
  });

  const lines = [];
  words.forEach((span) => {
    const last = lines[lines.length - 1];
    if (last && last.top === span.offsetTop) last.words.push(span.textContent);
    else lines.push({ top: span.offsetTop, words: [span.textContent] });
  });

  heading.textContent = "";
  lines.forEach((line, index) => {
    const mask = makeSpan("line");
    const inner = makeSpan("line__inner");
    mask.setAttribute("aria-hidden", "true");
    inner.style.setProperty("--line", index);
    inner.textContent = line.words.join(" ");
    mask.append(inner);
    heading.append(mask);
  });
  heading.classList.add("is-split");
}

/**
 * Prepares [data-lines] headings for the line reveal; reveal.js plays it when they scroll into view.
 * Resolves when every heading is split. It waits only for the heading font, not for every font on the page.
 */
export async function init() {
  const headings = $$("[data-lines]");
  if (!headings.length) return;

  if (prefersReducedMotion()) {
    headings.forEach((heading) => heading.classList.add("is-split"));
    return;
  }

  await Promise.all(headings.map(whenFontLoaded));
  headings.forEach(splitIntoLines);

  // Line breaks change with the width, so split again without replaying the reveal
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    headings
      .filter((heading) => heading.classList.contains("is-visible"))
      .forEach((heading) => {
        splitIntoLines(heading);
        $$(".line__inner", heading).forEach((inner) => {
          inner.style.transition = "none";
          inner.style.transform = "none";
        });
      });
  });
}
