import type { ApiPage, ApiTreeNode } from "@preactpress/plugin-typedoc/types";
/** Stable manifest schema version. */
export declare const OPENAPI_MANIFEST_VERSION: 1;
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options" | "trace";
export interface OpenApiInfo {
    title: string;
    description?: string;
    version: string;
}
export interface OpenApiServer {
    url: string;
    description?: string;
}
export interface OpenApiSecurityScheme {
    id: string;
    type: string;
    name?: string;
    in?: string;
    scheme?: string;
    bearerFormat?: string;
    description?: string;
}
export interface OpenApiTag {
    name: string;
    description?: string;
    slug: string;
}
export interface OpenApiExample {
    name: string;
    summary?: string;
    description?: string;
    value?: unknown;
}
export interface OpenApiSchemaProperty {
    name: string;
    type: string;
    format?: string;
    description?: string;
    required: boolean;
    nullable?: boolean;
    enum?: string[];
    default?: unknown;
    example?: unknown;
    ref?: string;
    items?: string;
}
/** Normalized schema record for documentation pages. */
export interface OpenApiSchema {
    id: string;
    name: string;
    slug: string;
    route: string;
    description?: string;
    type?: string;
    properties: OpenApiSchemaProperty[];
    required: string[];
    enum?: string[];
    example?: unknown;
    examples?: OpenApiExample[];
    tags: string[];
}
export interface OpenApiParameter {
    name: string;
    in: "path" | "query" | "header" | "cookie";
    description?: string;
    required: boolean;
    schema: string;
    example?: unknown;
    deprecated?: boolean;
}
export interface OpenApiRequestBody {
    description?: string;
    required: boolean;
    contentType: string;
    schema: string;
    example?: unknown;
    examples?: OpenApiExample[];
}
export interface OpenApiResponse {
    status: string;
    description?: string;
    contentType?: string;
    schema?: string;
    example?: unknown;
    examples?: OpenApiExample[];
}
/** Normalized operation record for endpoint pages. */
export interface OpenApiOperation {
    id: string;
    operationId?: string;
    slug: string;
    route: string;
    method: HttpMethod;
    path: string;
    summary?: string;
    description?: string;
    deprecated?: boolean;
    tags: string[];
    security: string[];
    parameters: OpenApiParameter[];
    requestBody?: OpenApiRequestBody;
    responses: OpenApiResponse[];
    examples?: OpenApiExample[];
}
/** Structured OpenAPI manifest decoupled from parser internals. */
export interface OpenApiManifest {
    version: typeof OPENAPI_MANIFEST_VERSION;
    generatedAt: string;
    sourceHash: string;
    source: string;
    baseRoute: string;
    outputDir: string;
    info: OpenApiInfo;
    servers: OpenApiServer[];
    securitySchemes: Record<string, OpenApiSecurityScheme>;
    tags: OpenApiTag[];
    operations: Record<string, OpenApiOperation>;
    schemas: Record<string, OpenApiSchema>;
    tree: ApiTreeNode[];
}
export interface OpenApiGenerationResult {
    manifest: OpenApiManifest;
    pages: ApiPage[];
}
//# sourceMappingURL=index.d.ts.map