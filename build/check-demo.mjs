import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT, DIST } from "./lib/paths.mjs";
import { devOnlyOutputs } from "./lib/dev-only.mjs";
import { exists } from "./lib/fs-utils.mjs";

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

/** A dist/ built with npm run dev or build:dev still holds the styleguide, which must never be deployed. */
async function devOnlyLeftovers() {
  const found = [];
  for (const output of devOnlyOutputs()) {
    if (await exists(path.join(DIST, output))) found.push(output);
  }
  return found;
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

const leftovers = await devOnlyLeftovers();
if (leftovers.length) {
  console.error(`\ndev-only output found in dist/:\n  ${leftovers.join("\n  ")}`);
  console.error("check:demo FAILED: dist/ is a development build. Run npm run build (production) and check again.");
  process.exit(1);
}

if (total) {
  console.error(
    `\ncheck:demo FAILED: ${total} demo-flagged item(s) remain. Replace them with real data before production.`,
  );
  process.exit(1);
}
console.log(`check:demo passed: no demo-flagged data in ${files.length} content file(s).`);
