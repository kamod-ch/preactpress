import { joinRoute, relativeHref } from "@preactpress/plugin-typedoc";
import { jsonBlock, renderCurlExample, renderJavaScriptExample, renderTypeScriptExample, schemaExample, } from "./examples.js";
function yamlEscape(value) {
    return value.replace(/"/g, '\\"');
}
function frontmatter(title, description, _tags = []) {
    const lines = [`title: "${yamlEscape(title)}"`];
    if (description) {
        lines.push(`description: "${yamlEscape(description.slice(0, 160).replace(/\n/g, " "))}"`);
    }
    else {
        lines.push(`description: "${yamlEscape(`${title} API reference`)}"`);
    }
    return `---\n${lines.join("\n")}\n---\n\n`;
}
function renderParameterTable(params, route) {
    if (!params.length)
        return "_None._\n";
    const rows = params.map((param) => `| \`${param.name}\` | ${param.in} | ${param.required ? "Yes" : "No"} | \`${param.schema}\` | ${param.example !== undefined ? `\`${JSON.stringify(param.example)}\`` : "—"} | ${param.description ?? ""} |`);
    return [
        "| Name | In | Required | Schema | Example | Description |",
        "| ---- | -- | -------- | ------ | ------- | ----------- |",
        ...rows,
        "",
    ].join("\n");
}
function renderSecurity(manifest, operation) {
    if (!operation.security.length)
        return "_No authentication required._\n";
    const lines = operation.security.map((name) => {
        const scheme = manifest.securitySchemes[name];
        if (!scheme)
            return `- \`${name}\``;
        const details = [scheme.type];
        if (scheme.scheme)
            details.push(scheme.scheme);
        if (scheme.in && scheme.name)
            details.push(`${scheme.in}: ${scheme.name}`);
        return `- **${name}** (${details.join(", ")})${scheme.description ? ` — ${scheme.description}` : ""}`;
    });
    return `${lines.join("\n")}\n`;
}
function renderOperationPage(manifest, operation) {
    const pathParams = operation.parameters.filter((param) => param.in === "path");
    const queryParams = operation.parameters.filter((param) => param.in === "query");
    const headerParams = operation.parameters.filter((param) => param.in === "header");
    const responseRows = operation.responses.map((response) => {
        const schemaLink = response.schema && manifest.schemas[response.schema]
            ? `[${response.schema}](${relativeHref(operation.route, manifest.schemas[response.schema].route)})`
            : response.schema
                ? `\`${response.schema}\``
                : "—";
        const example = response.example !== undefined ? `\`${JSON.stringify(response.example)}\`` : "—";
        return `| \`${response.status}\` | ${response.description ?? ""} | ${response.contentType ?? "—"} | ${schemaLink} | ${example} |`;
    });
    const requestBodySection = operation.requestBody
        ? [
            "## Request body",
            "",
            operation.requestBody.description ?? "",
            "",
            `- **Required:** ${operation.requestBody.required ? "Yes" : "No"}`,
            `- **Content type:** \`${operation.requestBody.contentType}\``,
            `- **Schema:** \`${operation.requestBody.schema}\``,
            "",
            operation.requestBody.example !== undefined
                ? `### Example\n\n${jsonBlock(operation.requestBody.example)}\n`
                : "",
        ].join("\n")
        : "";
    return [
        frontmatter(`${operation.method.toUpperCase()} ${operation.path}`, operation.summary ?? operation.description, [
            "api",
            "openapi",
            ...operation.tags,
            operation.method,
        ]),
        `# ${operation.method.toUpperCase()} ${operation.path}`,
        "",
        operation.summary ? `${operation.summary}\n` : "",
        operation.description ? `${operation.description}\n` : "",
        operation.deprecated ? "> **Deprecated**\n" : "",
        "## Authentication",
        "",
        renderSecurity(manifest, operation),
        "## Path parameters",
        "",
        renderParameterTable(pathParams, operation.route),
        "## Query parameters",
        "",
        renderParameterTable(queryParams, operation.route),
        "## Headers",
        "",
        renderParameterTable(headerParams, operation.route),
        requestBodySection,
        "## Responses",
        "",
        "| Status | Description | Content type | Schema | Example |",
        "| ------ | ----------- | ------------ | ------ | ------- |",
        ...responseRows,
        "",
        "## Examples",
        "",
        "### cURL",
        "",
        `\`\`\`bash\n${renderCurlExample(manifest, operation)}\n\`\`\``,
        "",
        "### JavaScript",
        "",
        `\`\`\`js\n${renderJavaScriptExample(manifest, operation)}\n\`\`\``,
        "",
        "### TypeScript",
        "",
        `\`\`\`ts\n${renderTypeScriptExample(manifest, operation)}\n\`\`\``,
        "",
    ]
        .filter(Boolean)
        .join("\n");
}
function renderSchemaPage(manifest, schema) {
    const rows = schema.properties.map((property) => {
        const required = property.required ? "Yes" : "No";
        const example = property.example !== undefined ? `\`${JSON.stringify(property.example)}\`` : "—";
        const ref = property.ref && manifest.schemas[property.ref]
            ? `[${property.ref}](${relativeHref(schema.route, manifest.schemas[property.ref].route)})`
            : property.ref
                ? `\`${property.ref}\``
                : "—";
        return `| \`${property.name}\` | \`${property.type}\` | ${required} | ${example} | ${ref} | ${property.description ?? ""} |`;
    });
    return [
        frontmatter(schema.name, schema.description, schema.tags),
        `# ${schema.name}`,
        "",
        schema.description ? `${schema.description}\n` : "",
        schema.type ? `**Type:** \`${schema.type}\`\n` : "",
        "## Properties",
        "",
        rows.length
            ? [
                "| Name | Type | Required | Example | Reference | Description |",
                "| ---- | ---- | -------- | ------- | --------- | ----------- |",
                ...rows,
                "",
            ].join("\n")
            : "_No properties defined._\n",
        "## Example",
        "",
        jsonBlock(schemaExample(schema)),
        "",
    ].join("\n");
}
function renderOverviewPage(manifest) {
    const serverLines = manifest.servers.length
        ? manifest.servers.map((server) => `- \`${server.url}\`${server.description ? ` — ${server.description}` : ""}`)
        : ["- _No servers declared in the specification._"];
    const tagLines = manifest.tags.map((tag) => {
        const route = joinRoute(manifest.baseRoute, "tags", tag.slug);
        return `- [${tag.name}](${route})${tag.description ? ` — ${tag.description}` : ""}`;
    });
    const operationLines = Object.values(manifest.operations)
        .sort((a, b) => `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`))
        .map((operation) => {
        return `- [\`${operation.method.toUpperCase()}\` ${operation.path}](${operation.route})${operation.summary ? ` — ${operation.summary}` : ""}`;
    });
    return [
        frontmatter("API Overview", manifest.info.description ?? `${manifest.info.title} OpenAPI reference`),
        `# ${manifest.info.title}`,
        "",
        manifest.info.description ? `${manifest.info.description}\n` : "",
        `**Version:** \`${manifest.info.version}\``,
        "",
        "## Servers",
        "",
        ...serverLines,
        "",
        "## Tags",
        "",
        ...tagLines,
        "",
        "## Endpoints",
        "",
        ...operationLines,
        "",
    ].join("\n");
}
function renderTagPage(manifest, tagSlug) {
    const tag = manifest.tags.find((entry) => entry.slug === tagSlug) ?? {
        name: tagSlug === "default" ? "Other" : tagSlug,
        slug: tagSlug,
        description: undefined,
    };
    const operations = Object.values(manifest.operations).filter((operation) => tagSlug === "default" ? operation.tags.includes("default") : operation.tags.includes(tag.name));
    const lines = operations
        .sort((a, b) => `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`))
        .map((operation) => {
        return `- [\`${operation.method.toUpperCase()}\` ${operation.path}](${operation.route})${operation.summary ? ` — ${operation.summary}` : ""}`;
    });
    return [
        frontmatter(tag.name, tag.description, ["api", "openapi", "tag", tag.name]),
        `# ${tag.name}`,
        "",
        tag.description ? `${tag.description}\n` : "",
        "## Endpoints",
        "",
        ...lines,
        "",
    ].join("\n");
}
function renderSchemasIndex(manifest) {
    const lines = Object.values(manifest.schemas)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((schema) => {
        return `- [${schema.name}](${schema.route})${schema.description ? ` — ${schema.description}` : ""}`;
    });
    return [
        frontmatter("Schemas", "OpenAPI component schemas"),
        "# Schemas",
        "",
        ...lines,
        "",
    ].join("\n");
}
function routeToRelativePath(baseRoute, route, outputDir) {
    const suffix = route.replace(baseRoute, "").replace(/^\//, "");
    if (!suffix)
        return `${outputDir}/index.md`;
    return `${outputDir}/${suffix}.md`;
}
export function renderOpenApiPages(manifest) {
    const pages = [
        {
            route: manifest.baseRoute,
            relativePath: `${manifest.outputDir}/index.md`,
            markdown: renderOverviewPage(manifest),
            title: manifest.info.title,
            description: manifest.info.description,
            tags: ["api", "openapi"],
        },
        {
            route: joinRoute(manifest.baseRoute, "schemas"),
            relativePath: routeToRelativePath(manifest.baseRoute, joinRoute(manifest.baseRoute, "schemas"), manifest.outputDir),
            markdown: renderSchemasIndex(manifest),
            title: "Schemas",
            description: "OpenAPI component schemas",
            tags: ["api", "openapi", "schemas"],
        },
    ];
    for (const tag of manifest.tags) {
        pages.push({
            route: joinRoute(manifest.baseRoute, "tags", tag.slug),
            relativePath: routeToRelativePath(manifest.baseRoute, joinRoute(manifest.baseRoute, "tags", tag.slug), manifest.outputDir),
            markdown: renderTagPage(manifest, tag.slug),
            title: tag.name,
            description: tag.description,
            tags: ["api", "openapi", "tag", tag.name],
        });
    }
    if (Object.values(manifest.operations).some((operation) => operation.tags.includes("default"))) {
        pages.push({
            route: joinRoute(manifest.baseRoute, "tags", "default"),
            relativePath: routeToRelativePath(manifest.baseRoute, joinRoute(manifest.baseRoute, "tags", "default"), manifest.outputDir),
            markdown: renderTagPage(manifest, "default"),
            title: "Other",
            tags: ["api", "openapi", "tag"],
        });
    }
    for (const operation of Object.values(manifest.operations)) {
        pages.push({
            route: operation.route,
            relativePath: routeToRelativePath(manifest.baseRoute, operation.route, manifest.outputDir),
            markdown: renderOperationPage(manifest, operation),
            title: `${operation.method.toUpperCase()} ${operation.path}`,
            description: operation.summary ?? operation.description,
            tags: ["api", "openapi", ...operation.tags, operation.method],
        });
    }
    for (const schema of Object.values(manifest.schemas)) {
        pages.push({
            route: schema.route,
            relativePath: routeToRelativePath(manifest.baseRoute, schema.route, manifest.outputDir),
            markdown: renderSchemaPage(manifest, schema),
            title: schema.name,
            description: schema.description,
            tags: schema.tags,
        });
    }
    return pages;
}
export function renderOpenApiDocs(manifest) {
    return {
        manifest,
        pages: renderOpenApiPages(manifest),
    };
}
//# sourceMappingURL=markdown.js.map