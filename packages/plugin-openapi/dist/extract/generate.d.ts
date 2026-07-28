import type { ResolvedConfig } from "@kamod-ch/preactpress/config";
import type { OpenApiGenerationResult, OpenApiManifest } from "../types/index.js";
import { type OpenApiInput } from "./load.js";
export interface OpenApiGenerateOptions {
    /** Local spec path or explicitly configured remote URL object. */
    input: OpenApiInput;
    /** Route prefix for generated pages. Default `/api`. */
    route?: string;
    /** Output directory relative to `srcDir`. Defaults to route without leading slash. */
    output?: string;
    cache?: boolean;
}
export declare function generateOpenApiDocs(config: Pick<ResolvedConfig, "root" | "srcDir" | "cacheDir">, options: OpenApiGenerateOptions): Promise<OpenApiGenerationResult>;
export declare function writeGeneratedPages(srcDir: string, result: OpenApiGenerationResult): Promise<void>;
export declare function writeStructuredManifest(configDir: string, manifest: OpenApiManifest): Promise<void>;
//# sourceMappingURL=generate.d.ts.map