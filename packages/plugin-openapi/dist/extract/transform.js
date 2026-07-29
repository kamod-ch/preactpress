import { joinRoute, slugifySegment } from "@preactpress/plugin-typedoc";
import { OPENAPI_MANIFEST_VERSION } from "../types/index.js";
const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
function refName(ref) {
  if (!ref) return undefined;
  const match = ref.match(/#\/components\/(?:schemas|responses|parameters|requestBodies)\/(.+)$/);
  return match?.[1];
}
function schemaTypeLabel(schema) {
  if (!schema) return "unknown";
  if ("$ref" in schema && typeof schema.$ref === "string") {
    return refName(schema.$ref) ?? schema.$ref;
  }
  if (schema.type === "array") {
    const items = schema.items;
    return `array<${schemaTypeLabel(items)}>`;
  }
  if (schema.allOf?.length) {
    return schema.allOf.map((entry) => schemaTypeLabel(entry)).join(" & ");
  }
  if (schema.oneOf?.length) {
    return schema.oneOf.map((entry) => schemaTypeLabel(entry)).join(" | ");
  }
  if (schema.anyOf?.length) {
    return schema.anyOf.map((entry) => schemaTypeLabel(entry)).join(" | ");
  }
  if (schema.enum?.length) return "enum";
  const typeValue = Array.isArray(schema.type) ? schema.type.join("|") : schema.type;
  const parts = [typeValue ?? "object"];
  if (schema.format) parts.push(schema.format);
  return parts.join(":");
}
function examplesFromMap(examples) {
  if (!examples) return undefined;
  const entries = Object.entries(examples);
  if (!entries.length) return undefined;
  return entries.map(([name, example]) => {
    const value =
      typeof example === "object" && example && "value" in example ? example.value : example;
    return {
      name,
      summary:
        typeof example === "object" && example && "summary" in example
          ? example.summary
          : undefined,
      description:
        typeof example === "object" && example && "description" in example
          ? example.description
          : undefined,
      value,
    };
  });
}
function schemaProperties(schema) {
  if (!schema?.properties) return [];
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties).map(([name, property]) => {
    const prop = property;
    return {
      name,
      type: schemaTypeLabel(prop),
      format: prop.format,
      description: prop.description,
      required: required.has(name),
      nullable:
        "nullable" in prop && typeof prop.nullable === "boolean" ? prop.nullable : undefined,
      enum: prop.enum?.map(String),
      default: prop.default,
      example: prop.example,
      ref: "$ref" in prop && typeof prop.$ref === "string" ? refName(prop.$ref) : undefined,
      items: prop.type === "array" ? schemaTypeLabel(prop.items) : undefined,
    };
  });
}
function operationSlug(method, pathTemplate) {
  const pathPart = pathTemplate
    .replace(/^\//, "")
    .split("/")
    .map((segment) => segment.replace(/^\{|\}$/g, ""))
    .filter(Boolean)
    .map(slugifySegment)
    .join("-");
  return slugifySegment(`${method}-${pathPart || "root"}`);
}
function schemaSlug(name) {
  return slugifySegment(name);
}
function parametersFromOperation(operation, pathItem) {
  const merged = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])];
  const params = [];
  for (const entry of merged) {
    const param = entry;
    if (!param?.name || !param.in) continue;
    params.push({
      name: param.name,
      in: param.in,
      description: param.description,
      required: Boolean(param.required),
      schema: schemaTypeLabel(param.schema),
      example: param.example ?? param.schema?.example,
      deprecated: param.deprecated,
    });
  }
  return params;
}
function requestBodyFromOperation(operation) {
  const body = operation.requestBody;
  if (!body?.content) return undefined;
  const [contentType, media] = Object.entries(body.content)[0] ?? [];
  if (!contentType || !media) return undefined;
  const schema = media.schema;
  return {
    description: body.description,
    required: Boolean(body.required),
    contentType,
    schema: schemaTypeLabel(schema),
    example: media.example ?? schema?.example,
    examples: examplesFromMap(media.examples),
  };
}
function responsesFromOperation(operation) {
  const responses = operation.responses ?? {};
  return Object.entries(responses).map(([status, response]) => {
    const value = response;
    const [contentType, media] = Object.entries(value.content ?? {})[0] ?? [];
    const mediaObject = media;
    const schema = mediaObject?.schema;
    return {
      status,
      description: value.description,
      contentType,
      schema: schema ? schemaTypeLabel(schema) : undefined,
      example: mediaObject?.example ?? schema?.example,
      examples: examplesFromMap(mediaObject?.examples),
    };
  });
}
function securityFromOperation(operation, document) {
  const requirements = operation.security ?? document.security ?? [];
  const names = new Set();
  for (const requirement of requirements) {
    for (const name of Object.keys(requirement)) {
      names.add(name);
    }
  }
  return [...names];
}
function securitySchemesFromDocument(document) {
  const schemes = document.components?.securitySchemes ?? {};
  const output = {};
  for (const [id, scheme] of Object.entries(schemes)) {
    const value = scheme;
    output[id] = {
      id,
      type: value.type,
      name: "name" in value ? value.name : undefined,
      in: "in" in value ? value.in : undefined,
      scheme: "scheme" in value ? value.scheme : undefined,
      bearerFormat: "bearerFormat" in value ? value.bearerFormat : undefined,
      description: value.description,
    };
  }
  return output;
}
function tagsFromDocument(document) {
  const tags = document.tags ?? [];
  const seen = new Set();
  const output = [];
  for (const tag of tags) {
    if (!tag.name || seen.has(tag.name)) continue;
    seen.add(tag.name);
    output.push({
      name: tag.name,
      description: tag.description,
      slug: slugifySegment(tag.name),
    });
  }
  return output.sort((a, b) => a.name.localeCompare(b.name));
}
function schemasFromDocument(document, baseRoute) {
  const schemas = document.components?.schemas ?? {};
  const output = {};
  for (const [name, schemaValue] of Object.entries(schemas)) {
    const schema = schemaValue;
    const slug = schemaSlug(name);
    const route = joinRoute(baseRoute, "schemas", slug);
    output[name] = {
      id: name,
      name,
      slug,
      route,
      description: schema.description,
      type: schemaTypeLabel(schema),
      properties: schemaProperties(schema),
      required: schema.required ?? [],
      enum: schema.enum?.map(String),
      example: schema.example,
      examples: examplesFromMap(
        schema.examples && !Array.isArray(schema.examples) ? schema.examples : undefined,
      ),
      tags: ["schema", name, ...(schema.required ?? [])],
    };
  }
  return output;
}
function operationsFromDocument(document, baseRoute) {
  const output = {};
  const paths = document.paths ?? {};
  for (const [pathTemplate, pathItemValue] of Object.entries(paths)) {
    const pathItem = pathItemValue;
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;
      const slug = operation.operationId
        ? slugifySegment(operation.operationId)
        : operationSlug(method, pathTemplate);
      const route = joinRoute(baseRoute, "operations", slug);
      const id = operation.operationId ?? slug;
      output[id] = {
        id,
        operationId: operation.operationId,
        slug,
        route,
        method,
        path: pathTemplate,
        summary: operation.summary,
        description: operation.description,
        deprecated: operation.deprecated,
        tags: operation.tags?.length ? operation.tags : ["default"],
        security: securityFromOperation(operation, document),
        parameters: parametersFromOperation(operation, pathItem),
        requestBody: requestBodyFromOperation(operation),
        responses: responsesFromOperation(operation),
      };
    }
  }
  return output;
}
function treeFromManifest(tags, operations, schemas, baseRoute) {
  const tagNodes = tags.map((tag) => ({
    id: `tag-${tag.slug}`,
    text: tag.name,
    link: joinRoute(baseRoute, "tags", tag.slug),
    items: Object.values(operations)
      .filter((operation) => operation.tags.includes(tag.name))
      .sort((a, b) => `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`))
      .map((operation) => ({
        id: operation.id,
        text: `${operation.method.toUpperCase()} ${operation.path}`,
        link: operation.route,
      })),
  }));
  const untagged = Object.values(operations).filter((operation) =>
    operation.tags.includes("default"),
  );
  if (untagged.length) {
    tagNodes.push({
      id: "tag-default",
      text: "Other",
      link: joinRoute(baseRoute, "tags", "default"),
      items: untagged.map((operation) => ({
        id: operation.id,
        text: `${operation.method.toUpperCase()} ${operation.path}`,
        link: operation.route,
      })),
    });
  }
  const schemaNodes = Object.values(schemas)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((schema) => ({
      id: schema.id,
      text: schema.name,
      link: schema.route,
    }));
  return [
    ...tagNodes,
    {
      id: "schemas",
      text: "Schemas",
      link: joinRoute(baseRoute, "schemas"),
      items: schemaNodes,
    },
  ];
}
export function transformOpenApiDocument(document, ctx) {
  const info = document.info ?? { title: "API", version: "0.0.0" };
  const servers = (document.servers ?? []).map((server) => ({
    url: server.url,
    description: server.description,
  }));
  const tags = tagsFromDocument(document);
  const discoveredTags = new Set(tags.map((tag) => tag.name));
  for (const operation of Object.values(document.paths ?? {})) {
    const pathItem = operation;
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      for (const tagName of op?.tags ?? []) {
        if (!discoveredTags.has(tagName)) {
          discoveredTags.add(tagName);
          tags.push({ name: tagName, slug: slugifySegment(tagName) });
        }
      }
    }
  }
  tags.sort((a, b) => a.name.localeCompare(b.name));
  const schemas = schemasFromDocument(document, ctx.baseRoute);
  const operations = operationsFromDocument(document, ctx.baseRoute);
  return {
    version: OPENAPI_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    sourceHash: ctx.sourceHash,
    source: ctx.source,
    baseRoute: ctx.baseRoute,
    outputDir: ctx.outputDir,
    info: {
      title: info.title,
      description: info.description,
      version: info.version,
    },
    servers,
    securitySchemes: securitySchemesFromDocument(document),
    tags,
    operations,
    schemas,
    tree: treeFromManifest(tags, operations, schemas, ctx.baseRoute),
  };
}
export { operationSlug, schemaSlug, schemaTypeLabel };
//# sourceMappingURL=transform.js.map
