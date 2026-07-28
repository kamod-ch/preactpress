import { linkifyTypeText, renderTypeRef, symbolAnchor } from "./links.js";
const PAGE_KINDS = new Set([
    "module",
    "namespace",
    "class",
    "interface",
    "type-alias",
    "enum",
    "function",
    "variable",
]);
function yamlEscape(value) {
    return value.replace(/"/g, '\\"');
}
function frontmatter(symbol) {
    const lines = [`title: "${yamlEscape(symbol.name)}"`];
    if (symbol.description)
        lines.push(`description: "${yamlEscape(symbol.description.slice(0, 160))}"`);
    lines.push("tags:");
    for (const tag of symbol.tags ?? ["api"]) {
        lines.push(`  - ${tag}`);
    }
    return `---\n${lines.join("\n")}\n---\n\n`;
}
function renderMeta(symbol) {
    const parts = [];
    if (symbol.deprecated)
        parts.push(`> **Deprecated:** ${symbol.deprecated}`);
    if (symbol.since)
        parts.push(`> **Since:** ${symbol.since}`);
    if (symbol.source) {
        const label = `${symbol.source.file}:${symbol.source.line}`;
        parts.push(symbol.source.url ? `> **Source:** [${label}](${symbol.source.url})` : `> **Source:** \`${label}\``);
    }
    return parts.length ? `${parts.join("\n")}\n\n` : "";
}
function renderTypeParameters(params, manifest, route) {
    if (!params?.length)
        return "";
    const rows = params.map((param) => {
        const constraint = param.constraint ? renderTypeRef(param.constraint, manifest, route) : "";
        const defaults = param.default ? renderTypeRef(param.default, manifest, route) : "";
        return `| \`${param.name}\` | ${constraint || "—"} | ${defaults || "—"} | ${param.description ?? ""} |`;
    });
    return [
        "### Type parameters",
        "",
        "| Name | Constraint | Default | Description |",
        "| ---- | ---------- | ------- | ----------- |",
        ...rows,
        "",
    ].join("\n");
}
function renderSignature(signature, manifest, route) {
    const params = signature.parameters.length
        ? signature.parameters
            .map((param) => {
            const optional = param.optional ? "?" : "";
            const type = renderTypeRef(param.type, manifest, route);
            const desc = param.description ? ` — ${param.description}` : "";
            return `- \`${param.name}${optional}\`: ${type}${desc}`;
        })
            .join("\n")
        : "_No parameters._";
    const returnType = signature.returnType
        ? renderTypeRef(signature.returnType, manifest, route)
        : "`void`";
    return [
        `\`${signature.name}(...)\``,
        "",
        "#### Parameters",
        "",
        params,
        "",
        "#### Returns",
        "",
        returnType,
        "",
        renderTypeParameters(signature.typeParameters, manifest, route),
    ].join("\n");
}
function renderMembers(symbol, manifest) {
    if (!symbol.members?.length)
        return "";
    const sections = ["## Members", ""];
    for (const memberId of symbol.members) {
        const member = manifest.symbols[memberId];
        if (!member)
            continue;
        sections.push(`### ${member.name} {#${member.name.toLowerCase()}}`, "");
        if (member.description)
            sections.push(linkifyTypeText(member.description, manifest, symbol.route), "");
        if (member.signatures?.length) {
            for (const signature of member.signatures) {
                sections.push(renderSignature(signature, manifest, symbol.route));
            }
        }
        else if (member.type) {
            sections.push(renderTypeRef(member.type, manifest, symbol.route), "");
        }
    }
    return `${sections.join("\n")}\n`;
}
function renderEnumMembers(symbol) {
    if (!symbol.enumMembers?.length)
        return "";
    const rows = symbol.enumMembers.map((member) => `| \`${member.name}\` | ${member.value ?? ""} | ${member.description ?? ""} |`);
    return [
        "## Enum members",
        "",
        "| Member | Value | Description |",
        "| ------ | ----- | ----------- |",
        ...rows,
        "",
    ].join("\n");
}
function renderExamples(examples) {
    if (!examples?.length)
        return "";
    return examples
        .map((example, index) => `### Example ${index + 1}\n\n\`\`\`ts\n${example}\n\`\`\`\n`)
        .join("\n");
}
function renderSymbolPage(symbol, manifest) {
    const description = symbol.description
        ? `${linkifyTypeText(symbol.description, manifest, symbol.route)}\n\n`
        : "";
    const signatures = symbol.signatures?.length
        ? symbol.signatures.map((signature) => renderSignature(signature, manifest, symbol.route)).join("\n")
        : "";
    const typeLine = symbol.type && !symbol.signatures?.length
        ? `## Type\n\n${renderTypeRef(symbol.type, manifest, symbol.route)}\n\n`
        : "";
    return [
        frontmatter(symbol),
        `# ${symbol.name}`,
        "",
        renderMeta(symbol),
        description,
        signatures,
        typeLine,
        renderEnumMembers(symbol),
        renderMembers(symbol, manifest),
        renderExamples(symbol.examples),
    ]
        .filter(Boolean)
        .join("\n");
}
function renderIndexPage(manifest) {
    const items = Object.values(manifest.symbols)
        .filter((symbol) => PAGE_KINDS.has(symbol.kind))
        .sort((a, b) => a.qualifiedName.localeCompare(b.qualifiedName))
        .map((symbol) => `- [${symbol.qualifiedName}](${symbol.route.replace(manifest.baseRoute, ".")})`);
    return [
        "---",
        'title: "API Reference"',
        'description: "Generated TypeScript API reference"',
        "tags:",
        "  - api",
        "---",
        "",
        "# API Reference",
        "",
        "Browse generated TypeScript API symbols:",
        "",
        ...items,
        "",
    ].join("\n");
}
function routeToRelativePath(baseRoute, route, outputDir) {
    const suffix = route.replace(baseRoute, "").replace(/^\//, "");
    if (!suffix)
        return `${outputDir}/index.md`;
    return `${outputDir}/${suffix}.md`;
}
export function renderApiPages(manifest) {
    const pages = [
        {
            route: manifest.baseRoute,
            relativePath: `${manifest.outputDir}/index.md`,
            markdown: renderIndexPage(manifest),
            title: "API Reference",
            description: "Generated TypeScript API reference",
            tags: ["api"],
        },
    ];
    for (const symbol of Object.values(manifest.symbols)) {
        if (!PAGE_KINDS.has(symbol.kind))
            continue;
        if (symbol.kind === "module" && symbol.route === manifest.baseRoute)
            continue;
        pages.push({
            route: symbol.route,
            relativePath: routeToRelativePath(manifest.baseRoute, symbol.route, manifest.outputDir),
            markdown: renderSymbolPage(symbol, manifest),
            title: symbol.name,
            description: symbol.description,
            tags: symbol.tags ?? ["api"],
        });
    }
    return pages;
}
export function renderApiDocs(manifest) {
    return {
        manifest,
        pages: renderApiPages(manifest),
    };
}
export { symbolAnchor };
//# sourceMappingURL=markdown.js.map