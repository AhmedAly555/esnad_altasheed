import { promises as fs } from "node:fs";
import path from "node:path";

export const readText = (file) => fs.readFile(file, "utf8");

export async function walk(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

export async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

/** Windows indexers and antivirus briefly hold fresh files, so removing a big folder needs a few retries. */
export const removeTree = (target) => fs.rm(target, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
