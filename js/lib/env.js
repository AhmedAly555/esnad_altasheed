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
