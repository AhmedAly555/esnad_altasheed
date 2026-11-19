import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// A wrapper instead of `ESNAD_STAGING=1 node ...`, which cmd.exe and PowerShell do not understand.
const buildScript = fileURLToPath(new URL("./build.mjs", import.meta.url));
const { status } = spawnSync(process.execPath, [buildScript], {
  stdio: "inherit",
  env: { ...process.env, ESNAD_STAGING: "1" },
});
process.exit(status ?? 1);
