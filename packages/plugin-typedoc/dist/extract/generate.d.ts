import type { ResolvedConfig } from "@kamod-ch/preactpress/config";
import type { ApiGenerationResult, ApiManifest } from "../types/index.js";
export interface TypedocGenerateOptions {
  entries: string[];
  output?: string;
  tsconfig?: string;
  includePrivate?: boolean;
  sourceLinks?: boolean;
  gitRemote?: string;
  gitBranch?: string;
  groupBy?: "module" | "kind";
  cache?: boolean;
}
export declare function generateApiReference(
  config: Pick<ResolvedConfig, "root" | "srcDir" | "cacheDir">,
  options: TypedocGenerateOptions,
): Promise<ApiGenerationResult>;
export declare function writeGeneratedPages(
  srcDir: string,
  result: ApiGenerationResult,
): Promise<void>;
export declare function writeStructuredManifest(
  configDir: string,
  manifest: ApiManifest,
): Promise<void>;
//# sourceMappingURL=generate.d.ts.map
