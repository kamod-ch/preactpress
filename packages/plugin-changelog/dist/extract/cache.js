import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
function hashInput(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
export function computeSourceHash(inputFingerprint) {
  return hashInput(inputFingerprint);
}
export function manifestCachePath(cacheDir) {
  return path.join(cacheDir, "changelog-manifest.json");
}
export function remoteCachePath(cacheDir, provider, key) {
  const safeKey = hashInput(key).slice(0, 16);
  return path.join(cacheDir, "remote", provider, `${safeKey}.json`);
}
export async function readManifestCache(options, sourceHash) {
  if (!options.enabled) return undefined;
  try {
    const raw = await fs.readFile(manifestCachePath(options.cacheDir), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.sourceHash === sourceHash) {
      return parsed.manifest;
    }
  } catch {
    /* cache miss */
  }
  return undefined;
}
export async function writeManifestCache(options, sourceHash, manifest) {
  if (!options.enabled) return;
  await fs.mkdir(options.cacheDir, { recursive: true });
  const record = {
    sourceHash,
    generatedAt: manifest.generatedAt,
    manifest,
  };
  await fs.writeFile(
    manifestCachePath(options.cacheDir),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
}
export async function readRemoteCache(cacheDir, provider, key) {
  try {
    const raw = await fs.readFile(remoteCachePath(cacheDir, provider, key), "utf8");
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
export async function writeRemoteCache(cacheDir, provider, key, record) {
  const file = remoteCachePath(cacheDir, provider, key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const payload = {
    ...record,
    fetchedAt: new Date().toISOString(),
  };
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
//# sourceMappingURL=cache.js.map
