import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PublishAction,
  buildPublishPlan,
  discoverWorkspacePackages,
  summarizePublishPlan,
} from "./publish-selection.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

function run(command, options = {}) {
  console.log(`\n[publish] $ ${command}`);
  execSync(command, {
    stdio: "inherit",
    encoding: "utf8",
    cwd: options.cwd ?? packageRoot,
  });
}

async function existsOnRegistry(name, version) {
  try {
    const output = execSync(`npm view ${JSON.stringify(`${name}@${version}`)} version --json`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      cwd: packageRoot,
    }).trim();
    const parsed = output ? JSON.parse(output) : null;
    const exists = parsed === version || (Array.isArray(parsed) && parsed.includes(version));
    return { ok: true, exists };
  } catch (error) {
    const stderr = error?.stderr?.toString?.() ?? "";
    const stdout = error?.stdout?.toString?.() ?? "";
    const combined = `${stdout}\n${stderr}`;
    if (combined.includes("E404") || combined.includes("404 No match found")) {
      return { ok: true, exists: false };
    }
    return { ok: false, error: "registry lookup failed (auth/network)" };
  }
}

async function main() {
  run("pnpm run verify:workspace");

  const packages = discoverWorkspacePackages(packageRoot);
  const { decisions, hasError } = await buildPublishPlan(packages, { existsOnRegistry });

  console.log("\n[publish] Preflight plan:\n" + summarizePublishPlan(decisions));

  if (hasError) {
    console.error("\n[publish] Aborting: registry uncertainty or invalid release state.");
    process.exit(1);
  }

  const toPublish = decisions.filter((entry) => entry.action === PublishAction.PUBLISH);
  for (const entry of toPublish) {
    run("npm pack --dry-run", { cwd: entry.package.dir });
  }

  if (dryRun) {
    console.log("\n[publish] Dry run complete; no packages were published.");
    return;
  }

  for (const entry of toPublish) {
    run("pnpm publish --access public --provenance --no-git-checks", { cwd: entry.package.dir });
    console.log(`[publish] Published ${entry.package.name}@${entry.package.version}`);
  }

  console.log("\n[publish] Publish run finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
