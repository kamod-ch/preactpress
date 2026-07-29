import type { ResolvedConfig } from "@kamod-ch/preactpress/config";
import type {
  ChangelogGenerationResult,
  ChangelogManifest,
  ChangelogPluginOptions,
} from "../types/index.js";
export interface ChangelogGenerateOptions extends ChangelogPluginOptions {}
export declare function generateChangelogDocs(
  config: Pick<ResolvedConfig, "root" | "srcDir" | "cacheDir"> & {
    versions?: ResolvedConfig["versions"];
  },
  options: ChangelogGenerateOptions,
): Promise<ChangelogGenerationResult>;
export declare function writeGeneratedPages(
  srcDir: string,
  result: ChangelogGenerationResult,
): Promise<void>;
export declare function writeStructuredManifest(
  configDir: string,
  manifest: ChangelogManifest,
): Promise<void>;
//# sourceMappingURL=generate.d.ts.map
