function yamlEscape(value) {
    return value.replace(/"/g, '\\"');
}
function frontmatter(title, options) {
    const lines = [`title: "${yamlEscape(title)}"`];
    if (options.description)
        lines.push(`description: "${yamlEscape(options.description.slice(0, 160))}"`);
    if (options.date)
        lines.push(`date: "${yamlEscape(options.date.slice(0, 10))}"`);
    if (options.version)
        lines.push(`version: "${yamlEscape(options.version)}"`);
    const tags = options.tags ?? ["changelog"];
    lines.push("tags:");
    for (const tag of tags)
        lines.push(`  - ${tag}`);
    return `---\n${lines.join("\n")}\n---\n\n`;
}
function renderSection(section) {
    const items = section.items.map((item) => {
        let line = `- ${item.text}`;
        if (item.author && !item.text.includes(`@${item.author}`)) {
            line += ` (@${item.author})`;
        }
        return line;
    });
    return [`### ${section.title}`, "", ...items, ""].join("\n");
}
function renderReleaseSections(release) {
    const breaking = release.sections.filter((section) => section.kind === "breaking");
    const features = release.sections.filter((section) => section.kind === "feature");
    const fixes = release.sections.filter((section) => section.kind === "fix");
    const other = release.sections.filter((section) => !["breaking", "feature", "fix"].includes(section.kind));
    const blocks = [];
    if (breaking.length) {
        blocks.push("## Breaking changes", "");
        for (const section of breaking)
            blocks.push(renderSection(section));
    }
    if (features.length) {
        blocks.push("## Features", "");
        for (const section of features)
            blocks.push(renderSection(section));
    }
    if (fixes.length) {
        blocks.push("## Fixes", "");
        for (const section of fixes)
            blocks.push(renderSection(section));
    }
    if (other.length) {
        blocks.push("## Other changes", "");
        for (const section of other)
            blocks.push(renderSection(section));
    }
    if (!blocks.length && release.description) {
        blocks.push(release.description, "");
    }
    return blocks.join("\n");
}
function renderMeta(release) {
    const lines = [];
    if (release.date)
        lines.push(`**Released:** ${release.date.slice(0, 10)}`);
    if (release.contributors.length) {
        lines.push(`**Contributors:** ${release.contributors.map((name) => `@${name}`).join(", ")}`);
    }
    if (release.sourceUrl)
        lines.push(`**Source:** [${release.version} release notes](${release.sourceUrl})`);
    if (release.migrationGuideUrl) {
        lines.push(`**Migration guide:** [View migration guide](${release.migrationGuideUrl})`);
    }
    if (!lines.length)
        return "";
    return `${lines.join("  \n")}\n\n`;
}
function renderReleasePage(release) {
    const title = release.title ?? release.version;
    return [
        frontmatter(title, {
            description: release.description,
            date: release.date,
            version: release.version,
            tags: ["changelog", "release", release.version, ...(release.prerelease ? ["prerelease"] : [])],
        }),
        `# ${title}`,
        "",
        renderMeta(release),
        renderReleaseSections(release),
    ].join("\n");
}
function renderOverviewPage(manifest) {
    const topLevel = manifest.releases.filter((release) => release.route.startsWith(manifest.baseRoute + "/"));
    const rows = topLevel
        .filter((release) => !release.draft)
        .map((release) => {
        const date = release.date?.slice(0, 10) ?? "—";
        const breaking = release.sections.some((section) => section.kind === "breaking") ? "Yes" : "—";
        const link = `[${release.version}](${release.route.replace(manifest.baseRoute, ".")})`;
        return `| ${link} | ${date} | ${breaking} |`;
    });
    return [
        frontmatter("Changelog", {
            description: `Release history${manifest.repository ? ` for ${manifest.repository}` : ""}`,
            tags: ["changelog", "releases"],
        }),
        "# Changelog",
        "",
        manifest.repository ? `_Source: [${manifest.repository}](https://github.com/${manifest.repository})_\n` : "",
        "| Version | Date | Breaking |",
        "| ------- | ---- | -------- |",
        ...rows,
        "",
        "## Recent releases",
        "",
        ...topLevel.slice(0, 5).flatMap((release) => [
            `### [${release.version}](${release.route.replace(manifest.baseRoute, ".")})`,
            "",
            release.date ? `_${release.date.slice(0, 10)}_${release.prerelease ? " · pre-release" : ""}` : "",
            "",
            release.description ? `${release.description.slice(0, 280)}${release.description.length > 280 ? "…" : ""}` : "",
            "",
        ]),
    ].join("\n");
}
function relativePathFromRoute(baseRoute, outputDir, route) {
    const suffix = route.startsWith(baseRoute)
        ? route.slice(baseRoute.length).replace(/^\//, "")
        : route.replace(/^\//, "");
    return suffix ? `${outputDir}/${suffix}/index.md` : `${outputDir}/index.md`;
}
export function renderChangelogDocs(manifest) {
    const pages = [];
    pages.push({
        route: manifest.baseRoute,
        relativePath: relativePathFromRoute(manifest.baseRoute, manifest.outputDir, manifest.baseRoute),
        markdown: renderOverviewPage(manifest),
        title: "Changelog",
        description: `Release history${manifest.repository ? ` for ${manifest.repository}` : ""}`,
        tags: ["changelog", "releases"],
    });
    for (const release of manifest.releases) {
        if (release.route === manifest.baseRoute)
            continue;
        if (release.slug === "index" && !release.sections.length)
            continue;
        pages.push({
            route: release.route,
            relativePath: relativePathFromRoute(manifest.baseRoute, manifest.outputDir, release.route),
            markdown: renderReleasePage(release),
            title: release.title ?? release.version,
            description: release.description,
            tags: ["changelog", "release", release.version],
        });
    }
    return { manifest, pages };
}
export { renderReleasePage, renderOverviewPage };
//# sourceMappingURL=markdown.js.map