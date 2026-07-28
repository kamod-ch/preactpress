import fs from "node:fs/promises";
import path from "node:path";
async function listChangesetFiles(dir) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name);
    }
    catch {
        return [];
    }
}
function parseChangesetFile(content) {
    const parts = content.split(/^---\s*$/m);
    if (parts.length < 3)
        return content.trim();
    return parts.slice(2).join("---").trim();
}
export const changesetsChangelogProvider = {
    id: "changesets",
    async computeSourceHash(context) {
        const dir = path.resolve(context.root, context.changesetsDir ?? ".changeset");
        const files = await listChangesetFiles(dir);
        const stats = await Promise.all(files.map(async (file) => {
            const stat = await fs.stat(path.join(dir, file));
            return `${file}:${stat.mtimeMs}:${stat.size}`;
        }));
        return `changesets:${dir}:${stats.sort().join("|")}`;
    },
    async fetchRawReleases(context) {
        const dir = path.resolve(context.root, context.changesetsDir ?? ".changeset");
        const files = await listChangesetFiles(dir);
        if (!files.length)
            return [];
        const entries = [];
        for (const file of files.sort()) {
            const raw = await fs.readFile(path.join(dir, file), "utf8");
            const summary = parseChangesetFile(raw);
            if (summary)
                entries.push(`- ${summary}`);
        }
        if (!entries.length)
            return [];
        return [
            {
                version: "Unreleased",
                title: "Pending changesets",
                body: ["### Pending changes", "", ...entries].join("\n"),
                sourceUrl: path.relative(context.root, dir) || ".changeset",
            },
        ];
    },
};
//# sourceMappingURL=changesets.js.map