// Mirrors the 64em breakpoint used for the desktop layout in css/components
const WIDE_QUERY = "(min-width: 64em)";

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const wideViewport = () => window.matchMedia(WIDE_QUERY);

/** Reads a numeric design token (milliseconds, ratios) from :root so JS and CSS share one source. */
export function cssNumber(name, fallback) {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isNaN(value) ? fallback : value;
}

export const whenFontsReady = () => (document.fonts ? document.fonts.ready : Promise.resolve());

/**
 * Resolves once the face an element is set in has loaded for the text it holds, ignoring every other font on the page.
 * A failed download resolves too: the text then simply renders in the fallback face.
 */
export function whenFontLoaded(element) {
  if (!document.fonts) return Promise.resolve();
  const { fontStyle, fontWeight, fontSize, fontFamily } = getComputedStyle(element);
  return document.fonts
    .load(`${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`, element.textContent)
    .catch(() => {});
}
