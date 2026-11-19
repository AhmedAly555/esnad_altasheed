import { build } from "./build.mjs";

// Both modes render different page sets, so a stale reference in a dev-only page only shows up in the dev build.
const MODES = [
  { name: "dev", options: { dev: true } },
  { name: "production", options: { dev: false } },
];

let failed = false;
for (const { name, options } of MODES) {
  try {
    const { pages, problems } = await build(options);
    if (problems.length) throw new Error(`${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
    console.log(`check: ${name} build OK (${pages.length} pages)`);
  } catch (error) {
    failed = true;
    console.error(`check: ${name} build FAILED: ${error.message}`);
  }
}
// The production build runs last, so dist/ never ends up as a dev build
process.exit(failed ? 1 : 0);
