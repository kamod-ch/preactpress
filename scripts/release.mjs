import { execSync } from "node:child_process";
import { readFileSync, unlinkSync } from "node:fs";
import pc from "picocolors";

const [, , bumpArg, ...flags] = process.argv;
const bump = bumpArg ?? "patch";
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

function warn(message) {
  console.warn(`${label("WARN", pc.yellow)} ${message}`);
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

function extractJsonPayload(text) {
  const start = text.search(/[\[{]/);
  if (start < 0) throw new Error("no JSON payload found");

  const stack = [];
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      stack.push(char);
      continue;
    }

    if (char === "}" || char === "]") {
      const expected = char === "}" ? "{" : "[";
      const actual = stack.pop();
      if (actual !== expected) throw new Error("invalid JSON payload");
      if (stack.length === 0) return text.slice(start, index + 1);
    }
  }

  throw new Error("unterminated JSON payload");
}

function getPackageJson() {
  try {
    return JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  } catch (error) {
    fail("could not read package.json", error);
  }
}

function assertNpmLogin() {
  const username = output("npm whoami");
  if (!username) fail("npm login required. Run: npm login");
  ok(`Logged in to npm as: ${pc.bold(username)}`);
}

function packAndInspect() {
  const packOutput = output("npm pack --json --ignore-scripts");

  let packed;
  try {
    const jsonText = extractJsonPayload(packOutput);
    [packed] = JSON.parse(jsonText);
  } catch (error) {
    fail("could not parse npm pack output", error);
  }

  const filename = packed?.filename;
  if (!filename) fail("npm pack did not return a tarball filename");

  run(`tar -tf ${JSON.stringify(filename)}`);

  try {
    unlinkSync(filename);
  } catch (error) {
    warn(`could not remove ${pc.bold(filename)}`);
  }
}

try {
  if (!allowed.has(bump)) {
    fail(`invalid release type: ${bump}. Use one of: patch, minor, major`);
  }

  const pkg = getPackageJson();
  info(
    `Preparing release for ${pc.magenta(`${pkg.name}@${pkg.version}`)}${dryRun ? pc.yellow(" (dry run)") : ""}`,
  );

  const branch = output("git branch --show-current");
  if (branch !== "main") {
    fail(`current branch is \"${branch}\", expected \"main\"`);
  }

  const status = output("git status --porcelain");
  if (status) {
    fail("working tree is not clean");
  }

  assertNpmLogin();

  run("pnpm install --frozen-lockfile");
  ok("Dependencies installed.");

  run("pnpm run verify");
  ok("Verification passed.");

  if (dryRun) {
    packAndInspect();
    ok("Package tarball created and inspected.");
    console.log();
    ok("Dry run completed successfully.");
    process.exit(0);
  }

  run(`npm version ${bump}`);
  ok(`Version bumped with ${pc.bold(bump)}.`);

  run("npm publish --access public");
  ok("Package published to npm.");

  run("git push --follow-tags");
  ok("Git commits and tags pushed.");

  console.log();
  ok("Release completed successfully.");
} catch (error) {
  fail("unexpected error", error);
}
