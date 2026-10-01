import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(packageRoot, "packages");

/** Publish order: typedoc first, then dependents. */
const PLUGIN_PUBLISH_ORDER = [
  "plugin-typedoc",
  "plugin-mermaid",
  "plugin-playground",
  "plugin-component-reference",
  "plugin-openapi",
  "plugin-changelog",
];

function run(command, options = {}) {
  console.log(`\n[publish] $ ${command}`);
  execSync(command, {
    stdio: "inherit",
    encoding: "utf8",
    cwd: options.cwd ?? packageRoot,
  });
}

function listPluginDirs() {
  const discovered = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("plugin-"))
    .map((entry) => entry.name);

  const ordered = PLUGIN_PUBLISH_ORDER.filter((name) => discovered.includes(name));
  const remaining = discovered.filter((name) => !ordered.includes(name)).sort();
  return [...ordered, ...remaining];
}

function readPluginPackage(dirName) {
  const pkgPath = path.join(packagesDir, dirName, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return { dir: path.join(packagesDir, dirName), name: pkg.name };
}

run("pnpm publish --access public --provenance --no-git-checks");

for (const dirName of listPluginDirs()) {
  const plugin = readPluginPackage(dirName);
  run("pnpm publish --access public --provenance --no-git-checks", { cwd: plugin.dir });
  console.log(`[publish] Published ${plugin.name}`);
}

console.log("\n[publish] All packages published.");
