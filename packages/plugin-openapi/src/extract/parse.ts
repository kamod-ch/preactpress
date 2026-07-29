import { parse as parseYamlDoc } from "yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import type { LoadedSpec } from "./load.js";
import type { OpenApiDocument } from "./openapi-types.js";

export class OpenApiParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenApiParseError";
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new OpenApiParseError(`Invalid JSON OpenAPI document: ${message}`);
  }
}

function parseYaml(raw: string): unknown {
  try {
    return parseYamlDoc(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new OpenApiParseError(`Invalid YAML OpenAPI document: ${message}`);
  }
}

export async function parseOpenApiDocument(spec: LoadedSpec): Promise<OpenApiDocument> {
  const parsed = spec.format === "json" ? parseJson(spec.raw) : parseYaml(spec.raw);

  if (!parsed || typeof parsed !== "object") {
    throw new OpenApiParseError("OpenAPI document must be a JSON or YAML object.");
  }

  const openapi = (parsed as { openapi?: string }).openapi;
  if (!openapi?.startsWith("3.")) {
    throw new OpenApiParseError(
      `Unsupported OpenAPI version "${openapi ?? "unknown"}". Only OpenAPI 3.x is supported.`,
    );
  }

  try {
    const bundled = await SwaggerParser.bundle(parsed as OpenApiDocument, {
      resolve: { external: true },
      dereference: { circular: "ignore" },
    });
    return bundled as OpenApiDocument;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new OpenApiParseError(`Failed to resolve OpenAPI references: ${message}`);
  }
}
