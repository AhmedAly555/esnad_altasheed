import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SRC = path.join(ROOT, "src");
export const DIST = path.join(ROOT, "dist");
export const CONTENT = path.join(ROOT, "content");
export const CSS = path.join(ROOT, "css");
