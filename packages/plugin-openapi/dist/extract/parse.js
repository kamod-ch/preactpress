import { parse as parseYamlDoc } from "yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
export class OpenApiParseError extends Error {
    constructor(message) {
        super(message);
        this.name = "OpenApiParseError";
    }
}
function parseJson(raw) {
    try {
        return JSON.parse(raw);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new OpenApiParseError(`Invalid JSON OpenAPI document: ${message}`);
    }
}
function parseYaml(raw) {
    try {
        return parseYamlDoc(raw);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new OpenApiParseError(`Invalid YAML OpenAPI document: ${message}`);
    }
}
export async function parseOpenApiDocument(spec) {
    const parsed = spec.format === "json" ? parseJson(spec.raw) : parseYaml(spec.raw);
    if (!parsed || typeof parsed !== "object") {
        throw new OpenApiParseError("OpenAPI document must be a JSON or YAML object.");
    }
    const openapi = parsed.openapi;
    if (!openapi?.startsWith("3.")) {
        throw new OpenApiParseError(`Unsupported OpenAPI version "${openapi ?? "unknown"}". Only OpenAPI 3.x is supported.`);
    }
    try {
        const bundled = await SwaggerParser.bundle(parsed, {
            resolve: { external: true },
            dereference: { circular: "ignore" },
        });
        return bundled;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new OpenApiParseError(`Failed to resolve OpenAPI references: ${message}`);
    }
}
//# sourceMappingURL=parse.js.map