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
export declare function computeSourceHash(inputFingerprint: string): string;
export declare function manifestCachePath(cacheDir: string): string;
export declare function remoteCachePath(cacheDir: string, provider: string, key: string): string;
export declare function readManifestCache(options: ChangelogCacheOptions, sourceHash: string): Promise<ChangelogManifest | undefined>;
export declare function writeManifestCache(options: ChangelogCacheOptions, sourceHash: string, manifest: ChangelogManifest): Promise<void>;
export declare function readRemoteCache<T>(cacheDir: string, provider: string, key: string): Promise<ChangelogRemoteCacheRecord & {
    payload: T;
} | undefined>;
export declare function writeRemoteCache(cacheDir: string, provider: string, key: string, record: Omit<ChangelogRemoteCacheRecord, "fetchedAt"> & {
    payload: unknown;
}): Promise<void>;
//# sourceMappingURL=cache.d.ts.map