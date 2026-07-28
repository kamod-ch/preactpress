import type { HttpMethod, OpenApiManifest } from "../types/index.js";
import type { OpenApiDocument, SchemaObject } from "./openapi-types.js";
export interface TransformContext {
    baseRoute: string;
    outputDir: string;
    source: string;
    sourceHash: string;
}
declare function schemaTypeLabel(schema: SchemaObject | undefined): string;
declare function operationSlug(method: HttpMethod, pathTemplate: string): string;
declare function schemaSlug(name: string): string;
export declare function transformOpenApiDocument(document: OpenApiDocument, ctx: TransformContext): OpenApiManifest;
export { operationSlug, schemaSlug, schemaTypeLabel };
//# sourceMappingURL=transform.d.ts.map