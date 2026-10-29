import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TOKEN_ENV_VARS = [
  "NODE_AUTH_TOKEN",
  "NPM_TOKEN",
  "npm_config__auth",
  "npm_config__authtoken",
];

const AUTH_LINE =
  /(?:^|:)_auth(?:token)?\s*=|\/\/registry\.npmjs\.org\/:_authToken\s*=|\/\/registry\.npmjs\.org\/:_.*auth/i;

function semverAtLeast(version, minimum) {
  const parse = (value) => value.split(".").map((part) => Number.parseInt(part, 10));
  const [a1, a2, a3] = parse(version);
  const [b1, b2, b3] = parse(minimum);
  if (a1 !== b1) return a1 > b1;
  if (a2 !== b2) return a2 > b2;
  return a3 >= b3;
}

function scanNpmrc(filePath) {
  if (!existsSync(filePath)) {
    return [];
  }

  const findings = [];
  const lines = readFileSync(filePath, "utf8").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) {
      continue;
    }
    if (AUTH_LINE.test(line)) {
      findings.push(`${filePath}:${index + 1}: unexpected registry auth directive`);
    }
  }
  return findings;
}

function main() {
  const issues = [];

  for (const name of TOKEN_ENV_VARS) {
    if (process.env[name]) {
      issues.push(`environment variable ${name} is set`);
    }
  }

  const npmrcPaths = [path.join(packageRoot, ".npmrc"), path.join(homedir(), ".npmrc")];
  for (const npmrcPath of npmrcPaths) {
    issues.push(...scanNpmrc(npmrcPath));
  }

  const npmVersion =
    process.env.npm_version?.trim() ||
    execSync("npm --version", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  if (!semverAtLeast(npmVersion, "11.5.1")) {
    issues.push(`npm ${npmVersion} is below the Trusted Publishing minimum (11.5.1)`);
  }

  if (issues.length > 0) {
    console.error("[publish-auth] Unexpected npm publish credentials or toolchain:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(
    "[publish-auth] OK: no long-lived npm credentials detected; npm meets Trusted Publishing minimum.",
  );
}

main();
