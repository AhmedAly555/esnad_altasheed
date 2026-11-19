import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT } from "./lib/paths.mjs";

const FLAGS = ["demo", "imageDemo"];

function scan(node, trail, hits) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => scan(item, [...trail, i], hits));
  } else if (node && typeof node === "object") {
    for (const flag of FLAGS) {
      if (node[flag] === true) {
        const label = node.slug || node.id || node.title || node.name || "";
        hits.push({ path: trail.join("."), flag, label: String(label) });
      }
    }
    for (const [k, v] of Object.entries(node)) {
      if (!FLAGS.includes(k)) scan(v, [...trail, k], hits);
    }
  }
}

const files = (await fs.readdir(CONTENT)).filter((f) => f.endsWith(".json"));

let total = 0;
for (const file of files) {
  const data = JSON.parse(await fs.readFile(path.join(CONTENT, file), "utf8"));
  const hits = [];
  scan(data, [], hits);
  if (!hits.length) continue;
  console.log(`\n${file}  (${hits.length})`);
  for (const h of hits) console.log(`  [${h.flag}] ${h.path || "(root)"}${h.label ? "  " + h.label : ""}`);
  total += hits.length;
}

if (total) {
  console.error(
    `\ncheck:demo FAILED: ${total} demo-flagged item(s) remain. Replace them with real data before production.`,
  );
  process.exit(1);
}
console.log(`check:demo passed: no demo-flagged data in ${files.length} content file(s).`);
