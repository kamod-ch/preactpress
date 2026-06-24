import { execSync } from "node:child_process";

const bump = process.argv[2] ?? "patch";
const dryRun = process.argv.includes("--dry");
const allowed = new Set(["patch", "minor", "major"]);

if (!allowed.has(bump)) {
  console.error(`Invalid release type: ${bump}`);
  console.error("Use one of: patch, minor, major");
  process.exit(1);
}

function run(command, options = {}) {
  console.log(`\n$ ${command}`);
  execSync(command, { stdio: "inherit", ...options });
}

function output(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

const branch = output("git branch --show-current");
if (branch !== "main") {
  console.error(`Release blocked: current branch is "${branch}", expected "main".`);
  process.exit(1);
}

const status = output("git status --porcelain");
if (status) {
  console.error("Release blocked: working tree is not clean.");
  process.exit(1);
}

run("npm whoami");
run("pnpm install");
run("pnpm run verify");

if (dryRun) {
  run("npm pack");
  run("tar -tf kamod-ch-preactpress-*.tgz");
  process.exit(0);
}

run(`npm version ${bump}`);
run("npm publish --access public");
run("git push --follow-tags");
