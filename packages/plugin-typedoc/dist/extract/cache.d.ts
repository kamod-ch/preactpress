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
export declare function computeSourceHash(
  root: string,
  entries: string[],
  tsconfig: string | undefined,
  includePrivate: boolean,
): Promise<string>;
export declare function cacheFilePath(cacheDir: string): string;
export declare function readCache(
  options: TypedocCacheOptions,
  sourceHash: string,
): Promise<ApiManifest | undefined>;
export declare function writeCache(
  options: TypedocCacheOptions,
  sourceHash: string,
  manifest: ApiManifest,
): Promise<void>;
//# sourceMappingURL=cache.d.ts.map
