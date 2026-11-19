import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";
import { CSS, CONTENT, ROOT } from "./lib/paths.mjs";
import { exists, readText } from "./lib/fs-utils.mjs";

// Generates the Open Graph card, favicons and touch icon from the logo.
// Run `npm run build:brand` after the logo or the company name changes, then commit assets/brand/.
const LOGO = path.join(ROOT, "assets", "logo", "logo-reversed.placeholder.svg");
const OUT = path.join(ROOT, "assets", "brand");
const FONT_DIR = path.join(ROOT, "assets", "fonts");

const OG_SIZE = { width: 1200, height: 630 };
const TOUCH_ICON_SIZE = 180;
const FAVICON_SIZE = 32;
// Leaves a margin around the mark so it survives rounded masks
const ICON_MARK_SCALE = 0.8;
const ICON_RADIUS = 12;
const BROWSERS = [
  process.env.BROWSER_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

async function tokens() {
  const css = await readText(path.join(CSS, "tokens.css"));
  return (name) => {
    const match = css.match(new RegExp(`--${name}:[ ]*(#[0-9a-fA-F]{6})`));
    if (!match) throw new Error(`Token --${name} not found in css/tokens.css`);
    return match[1];
  };
}

async function findBrowser() {
  for (const candidate of BROWSERS) if (await exists(candidate)) return candidate;
  throw new Error("No Chrome or Edge found. Set BROWSER_PATH to its executable.");
}

async function iconSvg(color) {
  const markup = (await readText(LOGO)).replace(/<\/?svg[^>]*>|<title>[\s\S]*?<\/title>/g, "");
  const offset = (64 * (1 - ICON_MARK_SCALE)) / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="${ICON_RADIUS}" fill="${color("green-700")}"/>` +
    `<g transform="translate(${offset} ${offset}) scale(${ICON_MARK_SCALE})">${markup}</g></svg>`
  );
}

function ogPage(color, company, logoSvg) {
  const font = (file) => pathToFileURL(path.join(FONT_DIR, file)).href;
  return `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><style>
@font-face{font-family:Kufi;font-weight:700;src:url("${font("noto-kufi-arabic-arabic-700-normal.woff2")}")}
@font-face{font-family:Kufi;font-weight:700;src:url("${font("noto-kufi-arabic-latin-700-normal.woff2")}");unicode-range:U+0000-00FF}
@font-face{font-family:Plex;font-weight:400;src:url("${font("ibm-plex-sans-arabic-arabic-400-normal.woff2")}")}
html,body{margin:0;width:${OG_SIZE.width}px;height:${OG_SIZE.height}px;background:${color("green-900")};overflow:hidden}
main{box-sizing:border-box;height:100%;padding:72px 88px;display:flex;flex-direction:column;justify-content:space-between;border-block-end:6px solid ${color("gold-500")}}
.mark{width:132px;height:132px}
h1{margin:0;font:700 112px/1.25 Kufi;color:${color("ivory")}}
.latin{margin:8px 0 0;font:700 30px/1 Kufi;letter-spacing:.32em;color:${color("gold-500")};direction:ltr;text-align:end}
.tagline{margin:0;font:400 38px/1.5 Plex;color:${color("mist")}}
</style><main><img class="mark" src="data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}" alt="">
<div><h1>${company.nameAr}</h1><p class="latin">${company.nameLatin}</p></div>
<p class="tagline">${company.taglineAr}</p></main></html>`;
}

async function renderOgCard(color, company) {
  const logoSvg = await readText(LOGO);
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "esnad-og-"));
  const page = path.join(workDir, "og.html");
  const shot = path.join(workDir, "og.png");
  try {
    await fs.writeFile(page, ogPage(color, company, logoSvg));
    await promisify(execFile)(await findBrowser(), [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      `--window-size=${OG_SIZE.width},${OG_SIZE.height}`,
      `--screenshot=${shot}`,
      pathToFileURL(page).href,
    ]);
    await sharp(shot).png({ palette: true }).toFile(path.join(OUT, "og-image.png"));
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

const color = await tokens();
const { company } = JSON.parse(await readText(path.join(CONTENT, "site.config.json")));
const favicon = await iconSvg(color);

await fs.mkdir(OUT, { recursive: true });
await fs.writeFile(path.join(OUT, "favicon.svg"), favicon + "\n");
await sharp(Buffer.from(favicon), { density: 600 }).resize(FAVICON_SIZE).png().toFile(path.join(OUT, "favicon-32.png"));
await sharp(Buffer.from(favicon.replace(` rx="${ICON_RADIUS}"`, "")), { density: 600 })
  .resize(TOUCH_ICON_SIZE)
  .png()
  .toFile(path.join(OUT, "apple-touch-icon.png"));
await renderOgCard(color, company);
console.log(`Wrote favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.png to ${path.relative(ROOT, OUT)}/`);
