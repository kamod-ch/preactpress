import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templates = ["default", "docs", "hono", "magazine"];
const check = process.argv.includes("--check");

for (const template of templates) {
  const cwd = path.join(packageRoot, "templates", template);
  const args = check ? ["install", "--frozen-lockfile"] : ["install"];
  console.log(`${check ? "Checking" : "Syncing"} templates/${template}...`);
  const result = spawnSync("pnpm", args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    if (check) {
      console.error(
        `\nTemplate lockfile out of date for "${template}". Run: pnpm run sync:template-lockfiles\n`,
      );
    }
    process.exit(result.status ?? 1);
  }
}
