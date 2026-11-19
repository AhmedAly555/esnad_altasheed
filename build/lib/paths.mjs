import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SRC = path.join(ROOT, "src");
// ESNAD_OUT builds somewhere else, so a check run cannot collide with a running `npm run dev`
const OUTPUT_ROOT = process.env.ESNAD_OUT ? path.resolve(process.env.ESNAD_OUT) : ROOT;
export const DIST = path.join(OUTPUT_ROOT, "dist");
// Every build is written here first; dist/ is only replaced once the build has succeeded
export const STAGING = path.join(OUTPUT_ROOT, ".dist-staging");
export const CONTENT = path.join(ROOT, "content");
export const CSS = path.join(ROOT, "css");
export const JS = path.join(ROOT, "js");
