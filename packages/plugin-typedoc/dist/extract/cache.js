import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
function hashInput(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
export async function computeSourceHash(root, entries, tsconfig, includePrivate) {
  const parts = [
    `includePrivate:${includePrivate}`,
    `entries:${entries.join("|")}`,
    `tsconfig:${tsconfig ?? ""}`,
  ];
  for (const entry of entries) {
    const abs = path.resolve(root, entry);
    const stat = await fs.stat(abs);
    parts.push(`${entry}:${stat.mtimeMs}`);
  }
  if (tsconfig) {
    const abs = path.resolve(root, tsconfig);
    const stat = await fs.stat(abs);
    parts.push(`tsconfig-mtime:${stat.mtimeMs}`);
  }
  return hashInput(parts.join("\n"));
}
export function cacheFilePath(cacheDir) {
  return path.join(cacheDir, "typedoc-manifest.json");
}
export async function readCache(options, sourceHash) {
  if (!options.enabled) return undefined;
  try {
    const raw = await fs.readFile(cacheFilePath(options.cacheDir), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.sourceHash === sourceHash) {
      return parsed.manifest;
    }
  } catch {
    /* cache miss */
  }
  return undefined;
}
export async function writeCache(options, sourceHash, manifest) {
  if (!options.enabled) return;
  await fs.mkdir(options.cacheDir, { recursive: true });
  const record = {
    sourceHash,
    generatedAt: manifest.generatedAt,
    manifest,
  };
  await fs.writeFile(
    cacheFilePath(options.cacheDir),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
}
//# sourceMappingURL=cache.js.map
