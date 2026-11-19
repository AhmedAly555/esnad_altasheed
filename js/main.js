import { whenFontsReady } from "./lib/env.js";
import { init as initMenu } from "./behaviors/menu.js";
import { init as initHeaderState } from "./behaviors/header-state.js";
import { init as initHeadlineLines } from "./behaviors/headline-lines.js";
import { init as initCountUp } from "./behaviors/count-up.js";
import { init as initReveal } from "./behaviors/reveal.js";
import { init as initParallax } from "./behaviors/parallax.js";
import { init as initProcessLine } from "./behaviors/process-line.js";

initMenu();
initHeaderState();
initParallax();
initProcessLine();

// Line splitting measures text, so it waits for the fonts. Order matters: split, prepare counters, then reveal.
whenFontsReady().then(() => {
  initHeadlineLines();
  initCountUp();
  initReveal();
});
