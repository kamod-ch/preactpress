import fs from "node:fs/promises";
import path from "node:path";
import { computeInputHash, loadSpec } from "./load.js";
import { parseOpenApiDocument } from "./parse.js";
import { transformOpenApiDocument } from "./transform.js";
import { computeSourceHash, readCache, writeCache } from "./cache.js";
import { renderOpenApiDocs } from "../render/markdown.js";
function normalizeBaseRoute(route) {
    return `/${route.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}
function outputFromRoute(route, output) {
    if (output)
        return output.replace(/^\/+/, "").replace(/\/+$/, "");
    return route.replace(/^\/+/, "").replace(/\/+$/, "") || "api";
}
export async function generateOpenApiDocs(config, options) {
    if (!options.input) {
        throw new Error("openapiPlugin: `input` is required.");
    }
    const baseRoute = normalizeBaseRoute(options.route ?? "/api");
    const outputDir = outputFromRoute(options.route ?? "/api", options.output);
    const inputFingerprint = await computeInputHash(config.root, options.input);
    const sourceHash = computeSourceHash(inputFingerprint);
    const cacheDir = path.join(config.cacheDir, "openapi");
    const cached = await readCache({ cacheDir, enabled: options.cache !== false }, sourceHash);
    if (cached) {
        return renderOpenApiDocs(cached);
    }
    const loaded = await loadSpec(config.root, options.input);
    const document = await parseOpenApiDocument(loaded);
    const manifest = transformOpenApiDocument(document, {
        baseRoute,
        outputDir,
        source: loaded.source,
        sourceHash,
    });
    if (options.cache !== false) {
        await writeCache({ cacheDir, enabled: true }, sourceHash, manifest);
    }
    return renderOpenApiDocs(manifest);
}
export async function writeGeneratedPages(srcDir, result) {
    for (const page of result.pages) {
        const abs = path.join(srcDir, page.relativePath);
        await fs.mkdir(path.dirname(abs), { recursive: true });
        await fs.writeFile(abs, page.markdown, "utf8");
    }
    const manifestPath = path.join(srcDir, result.manifest.outputDir, ".openapi-manifest.json");
    await fs.writeFile(manifestPath, `${JSON.stringify(result.manifest, null, 2)}\n`, "utf8");
}
export async function writeStructuredManifest(configDir, manifest) {
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(path.join(configDir, "openapi-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}
//# sourceMappingURL=generate.js.map