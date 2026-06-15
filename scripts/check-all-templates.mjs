import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { init, INIT_TEMPLATES } from "../dist/node/init.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const template of INIT_TEMPLATES) {
  const root = await mkdtemp(path.join(tmpdir(), `preactpress-check-${template}-`));
  try {
    await init(root, { template });
    const result = spawnSync("node", ["./bin/preactpress.mjs", "check", root], {
      cwd: packageRoot,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      process.exitCode = result.status ?? 1;
      break;
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
