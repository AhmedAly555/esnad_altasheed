import { $$ } from "../lib/dom.js";

/** Fills every [data-token] element with the live value of that CSS custom property. */
function showTokenValues() {
  const styles = getComputedStyle(document.documentElement);
  $$("[data-token]").forEach((element) => {
    element.textContent = styles.getPropertyValue(`--${element.dataset.token}`).trim().replace(/\s+/g, " ");
  });
}

showTokenValues();
