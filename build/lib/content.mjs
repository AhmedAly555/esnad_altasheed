import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT } from "./paths.mjs";
import { readText } from "./fs-utils.mjs";

const keyFor = (file) => (file === "site.config.json" ? "site" : path.basename(file, ".json"));

// Cards in the first screenful of the projects page load at once; everything below the fold waits
const ABOVE_THE_FOLD_CARDS = 3;

const addressLine = ({ lineAr, cityAr }) => `${lineAr}، ${cityAr}`;

/** Values derived from content, so no URL-encoded Arabic or joining punctuation is ever typed into a template. */
function derive({ site, contact }) {
  site.address.fullAr = addressLine(site.address);
  contact.whatsappUrl = `https://wa.me/${site.contact.whatsapp.href}?text=${encodeURIComponent(contact.whatsappMessage)}`;
  contact.mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.fullAr)}`;
}

/** Every content/*.json becomes a template value named after its file (site.config.json becomes "site"). */
export async function loadContent() {
  const content = {};
  for (const file of (await fs.readdir(CONTENT)).filter((name) => name.endsWith(".json"))) {
    content[keyFor(file)] = JSON.parse(await readText(path.join(CONTENT, file)));
  }
  content.projects.items.forEach((project, index) => {
    project.loading = index < ABOVE_THE_FOLD_CARDS ? "eager" : "lazy";
    project.priority = index === 0 ? "high" : "auto";
  });
  // The home teaser sits below the hero, so its cards are always lazy
  content.featuredProjects = content.projects.items
    .filter((project) => project.featured)
    .map((project) => ({ ...project, loading: "lazy", priority: "auto" }));
  derive(content);
  return content;
}
