import fs from "node:fs/promises";
import path from "node:path";
function detectFormat(source, raw) {
    const ext = path.extname(source).toLowerCase();
    if (ext === ".json")
        return "json";
    if (ext === ".yaml" || ext === ".yml")
        return "yaml";
    const trimmed = raw.trimStart();
    if (trimmed.startsWith("{"))
        return "json";
    return "yaml";
}
function isRemoteInput(input) {
    return typeof input === "object" && "url" in input;
}
export async function loadSpec(root, input) {
    if (isRemoteInput(input)) {
        const response = await fetch(input.url, {
            headers: input.headers,
        });
        if (!response.ok) {
            throw new Error(`openapiPlugin: failed to fetch ${input.url} (${response.status} ${response.statusText})`);
        }
        const raw = await response.text();
        return {
            source: input.url,
            raw,
            format: detectFormat(input.url, raw),
        };
    }
    const abs = path.resolve(root, input);
    const raw = await fs.readFile(abs, "utf8");
    return {
        source: path.relative(root, abs) || input,
        raw,
        format: detectFormat(abs, raw),
    };
}
export async function computeInputHash(root, input) {
    if (isRemoteInput(input)) {
        return `remote:${input.url}:${JSON.stringify(input.headers ?? {})}`;
    }
    const abs = path.resolve(root, input);
    const stat = await fs.stat(abs);
    return `file:${abs}:${stat.mtimeMs}:${stat.size}`;
}
//# sourceMappingURL=load.js.map