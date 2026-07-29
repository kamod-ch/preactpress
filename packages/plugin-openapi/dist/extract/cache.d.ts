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
export declare function computeSourceHash(inputFingerprint: string): string;
export declare function cacheFilePath(cacheDir: string): string;
export declare function readCache(
  options: OpenApiCacheOptions,
  sourceHash: string,
): Promise<OpenApiManifest | undefined>;
export declare function writeCache(
  options: OpenApiCacheOptions,
  sourceHash: string,
  manifest: OpenApiManifest,
): Promise<void>;
//# sourceMappingURL=cache.d.ts.map
