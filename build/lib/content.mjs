import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT } from "./paths.mjs";
import { readText } from "./fs-utils.mjs";

const keyFor = (file) => (file === "site.config.json" ? "site" : path.basename(file, ".json"));

/** Every content/*.json becomes a template value named after its file (site.config.json becomes "site"). */
export async function loadContent() {
  const content = {};
  for (const file of (await fs.readdir(CONTENT)).filter((name) => name.endsWith(".json"))) {
    content[keyFor(file)] = JSON.parse(await readText(path.join(CONTENT, file)));
  }
  content.featuredProjects = content.projects.filter((project) => project.featured);
  return content;
}
