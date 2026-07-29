import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pc from "picocolors";

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

const [, , bumpArg, ...flags] = process.argv;
const bump = bumpArg && !bumpArg.startsWith("--") ? bumpArg : undefined;
const dryRun = flags.includes("--dry");
const allowed = new Set(["patch", "minor", "major"]);

function label(type, color) {
  return pc.bold(color(`[{${type}}]`));
}

function info(message) {
  console.log(`${label("INFO", pc.blue)} ${message}`);
}

function ok(message) {
  console.log(`${label("OK", pc.green)} ${message}`);
}

function errorLog(message) {
  console.error(`${label("ERROR", pc.red)} ${pc.red(message)}`);
}

function fail(message, error) {
  console.error();
  errorLog(message);
  if (error) {
    const detail = error?.stderr?.toString?.().trim() || error?.message || String(error);
    if (detail) errorLog(detail);
  }
  process.exit(1);
}

function run(command, options = {}) {
  console.log(`\n${label("INFO", pc.blue)} ${pc.cyan("$")} ${pc.cyan(command)}`);
  try {
    return execSync(command, {
      stdio: "inherit",
      encoding: "utf8",
      ...options,
    });
  } catch (error) {
    fail(`command failed: ${command}`, error);
  }
}

function output(command, options = {}) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    }).trim();
  } catch (error) {
    fail(`command failed: ${command}`, error);
  }
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
  if (!pkg.name || !pkg.version) {
    fail(`invalid package.json in packages/${dirName}`);
  }
  return { dirName, dir: path.join(packagesDir, dirName), name: pkg.name, version: pkg.version };
}

function assertReleaseEnvironment() {
  const branch = output("git branch --show-current");
  if (branch !== "main") {
    fail(`current branch is "${branch}", expected "main"`);
  }

  const status = output("git status --porcelain");
  if (status) {
    fail("working tree is not clean");
  }

  const username = output("npm whoami");
  if (!username) fail("npm login required. Run: npm login");
  ok(`Logged in to npm as: ${pc.bold(username)}`);
}

try {
  if (bump && !allowed.has(bump)) {
    fail(`invalid release type: ${bump}. Use one of: patch, minor, major`);
  }

  const plugins = listPluginDirs().map(readPluginPackage);
  if (plugins.length === 0) {
    fail("no plugin packages found under packages/");
  }

  info(
    `Preparing plugin release for ${plugins.length} packages${dryRun ? pc.yellow(" (dry run)") : ""}`,
  );
  for (const plugin of plugins) {
    info(`  ${pc.magenta(`${plugin.name}@${plugin.version}`)}`);
  }

  assertReleaseEnvironment();
  run("pnpm install --frozen-lockfile");
  ok("Dependencies installed.");

  run("pnpm run build");
  ok("Core package built.");

  for (const plugin of plugins) {
    run(`pnpm run build`, { cwd: plugin.dir });
    ok(`Built ${plugin.name}.`);
  }

  if (dryRun) {
    for (const plugin of plugins) {
      run(`npm pack --dry-run`, { cwd: plugin.dir });
    }
    console.log();
    ok("Plugin dry run completed successfully.");
    process.exit(0);
  }

  for (const plugin of plugins) {
    if (bump) {
      run(`npm version ${bump}`, { cwd: plugin.dir });
      ok(`Version bumped ${plugin.name} (${bump}).`);
    }
    run("npm publish --access public", { cwd: plugin.dir });
    ok(`Published ${plugin.name}.`);
  }

  if (bump) {
    run("git add packages/*/package.json");
    run(`git commit -m "chore: bump @preactpress plugin versions (${bump})"`);
    run("git push");
    ok("Plugin version bumps committed and pushed.");
  }

  console.log();
  ok("Plugin release completed successfully.");
} catch (error) {
  fail("unexpected error", error);
}
