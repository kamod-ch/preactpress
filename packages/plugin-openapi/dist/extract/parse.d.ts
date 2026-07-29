import type { LoadedSpec } from "./load.js";
import type { OpenApiDocument } from "./openapi-types.js";
export declare class OpenApiParseError extends Error {
  constructor(message: string);
}
export declare function parseOpenApiDocument(spec: LoadedSpec): Promise<OpenApiDocument>;
//# sourceMappingURL=parse.d.ts.map
