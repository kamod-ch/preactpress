import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { ChangelogManifest } from "../types/index.js";

export interface ChangelogCacheRecord {
  sourceHash: string;
  generatedAt: string;
  manifest: ChangelogManifest;
}

export interface ChangelogCacheOptions {
  cacheDir: string;
  enabled: boolean;
}

export interface ChangelogRemoteCacheRecord {
  sourceHash: string;
  fetchedAt: string;
  etag?: string;
  payload: unknown;
}

function hashInput(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function computeSourceHash(inputFingerprint: string): string {
  return hashInput(inputFingerprint);
}

export function manifestCachePath(cacheDir: string): string {
  return path.join(cacheDir, "changelog-manifest.json");
}

export function remoteCachePath(cacheDir: string, provider: string, key: string): string {
  const safeKey = hashInput(key).slice(0, 16);
  return path.join(cacheDir, "remote", provider, `${safeKey}.json`);
}

export async function readManifestCache(
  options: ChangelogCacheOptions,
  sourceHash: string,
): Promise<ChangelogManifest | undefined> {
  if (!options.enabled) return undefined;
  try {
    const raw = await fs.readFile(manifestCachePath(options.cacheDir), "utf8");
    const parsed = JSON.parse(raw) as ChangelogCacheRecord;
    if (parsed.sourceHash === sourceHash) {
      return parsed.manifest;
    }
  } catch {
    /* cache miss */
  }
  return undefined;
}

export async function writeManifestCache(
  options: ChangelogCacheOptions,
  sourceHash: string,
  manifest: ChangelogManifest,
): Promise<void> {
  if (!options.enabled) return;
  await fs.mkdir(options.cacheDir, { recursive: true });
  const record: ChangelogCacheRecord = {
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

export async function readRemoteCache<T>(
  cacheDir: string,
  provider: string,
  key: string,
): Promise<(ChangelogRemoteCacheRecord & { payload: T }) | undefined> {
  try {
    const raw = await fs.readFile(remoteCachePath(cacheDir, provider, key), "utf8");
    return JSON.parse(raw) as ChangelogRemoteCacheRecord & { payload: T };
  } catch {
    return undefined;
  }
}

export async function writeRemoteCache(
  cacheDir: string,
  provider: string,
  key: string,
  record: Omit<ChangelogRemoteCacheRecord, "fetchedAt"> & { payload: unknown },
): Promise<void> {
  const file = remoteCachePath(cacheDir, provider, key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const payload: ChangelogRemoteCacheRecord = {
    ...record,
    fetchedAt: new Date().toISOString(),
  };
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
