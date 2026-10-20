import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FILES = ["README.md", "CONTRIBUTING.md", "ROADMAP.md", "UPGRADE.md", "RELEASE-REPORT.md"];

const LINK_RE = /\[[^\]]+\]\(([^)]+)\)/g;

function isExternal(target) {
  return /^(https?:|mailto:|#)/.test(target);
}

function resolveLocal(fromFile, target) {
  const withoutHash = target.split("#")[0];
  if (!withoutHash) return null;
  return path.resolve(path.dirname(fromFile), withoutHash);
}

function checkFile(relativePath) {
  const abs = path.join(packageRoot, relativePath);
  const content = readFileSync(abs, "utf8");
  const missing = [];

  for (const match of content.matchAll(LINK_RE)) {
    const target = match[1].trim();
    if (isExternal(target)) continue;
    const resolved = resolveLocal(abs, target);
    if (!resolved || !existsSync(resolved)) {
      missing.push({ file: relativePath, target });
    }
  }

  return missing;
}

const allMissing = FILES.flatMap(checkFile);
if (allMissing.length > 0) {
  for (const entry of allMissing) {
    console.error(`missing link in ${entry.file}: ${entry.target}`);
  }
  process.exit(1);
}

console.log(`maintainer link check OK (${FILES.length} files)`);
