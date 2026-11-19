import { whenFontsReady } from "./lib/env.js";
import { init as initFileLinks } from "./behaviors/file-links.js";
import { init as initMenu } from "./behaviors/menu.js";
import { init as initHeaderState } from "./behaviors/header-state.js";
import { init as initHeadlineLines } from "./behaviors/headline-lines.js";
import { init as initCountUp } from "./behaviors/count-up.js";
import { init as initReveal } from "./behaviors/reveal.js";
import { init as initParallax } from "./behaviors/parallax.js";
import { init as initProcessLine } from "./behaviors/process-line.js";

initFileLinks();
initMenu();
initHeaderState();
initParallax();
initProcessLine();

// Headings are split before the first reveal so no line animates twice. Counters measure text, so they wait for all fonts.
initHeadlineLines().then(initReveal);
whenFontsReady().then(initCountUp);
