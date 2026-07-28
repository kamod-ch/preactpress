import type { OpenApiManifest, OpenApiOperation, OpenApiSchema } from "../types/index.js";
export declare function renderCurlExample(manifest: OpenApiManifest, operation: OpenApiOperation): string;
export declare function renderJavaScriptExample(manifest: OpenApiManifest, operation: OpenApiOperation): string;
export declare function renderTypeScriptExample(manifest: OpenApiManifest, operation: OpenApiOperation): string;
export declare function schemaExample(schema: OpenApiSchema): unknown;
export declare function jsonBlock(value: unknown): string;
//# sourceMappingURL=examples.d.ts.map