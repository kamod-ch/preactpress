import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import type { OpenApiGenerateOptions } from "./extract/generate.js";
import type { OpenApiExplorerAdapter } from "./explorer/types.js";
export interface OpenApiPluginOptions extends OpenApiGenerateOptions {
    /** Reserved adapter hook for a future interactive API explorer. */
    explorer?: OpenApiExplorerAdapter;
}
/** Official PreactPress plugin for OpenAPI 3.x documentation pages. */
export declare function openapiPlugin(options: OpenApiPluginOptions): PreactPressPlugin;
export { generateOpenApiDocs, writeGeneratedPages } from "./extract/generate.js";
export { renderOpenApiDocs } from "./render/markdown.js";
export type { OpenApiManifest, OpenApiOperation, OpenApiSchema, OpenApiGenerationResult, } from "./types/index.js";
export type { OpenApiExplorerAdapter, ExplorerRequest, ExplorerResponse } from "./explorer/types.js";
export { disabledExplorerAdapter } from "./explorer/types.js";
//# sourceMappingURL=index.d.ts.map