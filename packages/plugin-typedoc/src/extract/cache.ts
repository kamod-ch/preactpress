import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { ApiManifest } from "../types/index.js";

export interface TypedocCacheRecord {
  sourceHash: string;
  generatedAt: string;
  manifest: ApiManifest;
}

export interface TypedocCacheOptions {
  cacheDir: string;
  enabled: boolean;
}

function hashInput(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function computeSourceHash(
  root: string,
  entries: string[],
  tsconfig: string | undefined,
  includePrivate: boolean,
): Promise<string> {
  const parts = [`includePrivate:${includePrivate}`, `entries:${entries.join("|")}`, `tsconfig:${tsconfig ?? ""}`];
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

export function cacheFilePath(cacheDir: string): string {
  return path.join(cacheDir, "typedoc-manifest.json");
}

export async function readCache(
  options: TypedocCacheOptions,
  sourceHash: string,
): Promise<ApiManifest | undefined> {
  if (!options.enabled) return undefined;
  try {
    const raw = await fs.readFile(cacheFilePath(options.cacheDir), "utf8");
    const parsed = JSON.parse(raw) as TypedocCacheRecord;
    if (parsed.sourceHash === sourceHash) {
      return parsed.manifest;
    }
  } catch {
    /* cache miss */
  }
  return undefined;
}

export async function writeCache(
  options: TypedocCacheOptions,
  sourceHash: string,
  manifest: ApiManifest,
): Promise<void> {
  if (!options.enabled) return;
  await fs.mkdir(options.cacheDir, { recursive: true });
  const record: TypedocCacheRecord = {
    sourceHash,
    generatedAt: manifest.generatedAt,
    manifest,
  };
  await fs.writeFile(cacheFilePath(options.cacheDir), `${JSON.stringify(record, null, 2)}\n`, "utf8");
}
