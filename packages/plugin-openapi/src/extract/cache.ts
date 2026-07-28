import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { OpenApiManifest } from "../types/index.js";

export interface OpenApiCacheRecord {
  sourceHash: string;
  generatedAt: string;
  manifest: OpenApiManifest;
}

export interface OpenApiCacheOptions {
  cacheDir: string;
  enabled: boolean;
}

function hashInput(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function computeSourceHash(inputFingerprint: string): string {
  return hashInput(inputFingerprint);
}

export function cacheFilePath(cacheDir: string): string {
  return path.join(cacheDir, "openapi-manifest.json");
}

export async function readCache(
  options: OpenApiCacheOptions,
  sourceHash: string,
): Promise<OpenApiManifest | undefined> {
  if (!options.enabled) return undefined;
  try {
    const raw = await fs.readFile(cacheFilePath(options.cacheDir), "utf8");
    const parsed = JSON.parse(raw) as OpenApiCacheRecord;
    if (parsed.sourceHash === sourceHash) {
      return parsed.manifest;
    }
  } catch {
    /* cache miss */
  }
  return undefined;
}

export async function writeCache(
  options: OpenApiCacheOptions,
  sourceHash: string,
  manifest: OpenApiManifest,
): Promise<void> {
  if (!options.enabled) return;
  await fs.mkdir(options.cacheDir, { recursive: true });
  const record: OpenApiCacheRecord = {
    sourceHash,
    generatedAt: manifest.generatedAt,
    manifest,
  };
  await fs.writeFile(cacheFilePath(options.cacheDir), `${JSON.stringify(record, null, 2)}\n`, "utf8");
}
