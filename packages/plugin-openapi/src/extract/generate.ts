import fs from "node:fs/promises";
import path from "node:path";
import type { ResolvedConfig } from "@kamod-ch/preactpress/config";
import type { OpenApiGenerationResult, OpenApiManifest } from "../types/index.js";
import { computeInputHash, loadSpec, type OpenApiInput } from "./load.js";
import { parseOpenApiDocument } from "./parse.js";
import { transformOpenApiDocument } from "./transform.js";
import { computeSourceHash, readCache, writeCache } from "./cache.js";
import { renderOpenApiDocs } from "../render/markdown.js";

export interface OpenApiGenerateOptions {
  /** Local spec path or explicitly configured remote URL object. */
  input: OpenApiInput;
  /** Route prefix for generated pages. Default `/api`. */
  route?: string;
  /** Output directory relative to `srcDir`. Defaults to route without leading slash. */
  output?: string;
  cache?: boolean;
}

function normalizeBaseRoute(route: string): string {
  return `/${route.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function outputFromRoute(route: string, output?: string): string {
  if (output) return output.replace(/^\/+/, "").replace(/\/+$/, "");
  return route.replace(/^\/+/, "").replace(/\/+$/, "") || "api";
}

export async function generateOpenApiDocs(
  config: Pick<ResolvedConfig, "root" | "srcDir" | "cacheDir">,
  options: OpenApiGenerateOptions,
): Promise<OpenApiGenerationResult> {
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

export async function writeGeneratedPages(
  srcDir: string,
  result: OpenApiGenerationResult,
): Promise<void> {
  for (const page of result.pages) {
    const abs = path.join(srcDir, page.relativePath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, page.markdown, "utf8");
  }

  const manifestPath = path.join(srcDir, result.manifest.outputDir, ".openapi-manifest.json");
  await fs.writeFile(manifestPath, `${JSON.stringify(result.manifest, null, 2)}\n`, "utf8");
}

export async function writeStructuredManifest(
  configDir: string,
  manifest: OpenApiManifest,
): Promise<void> {
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "openapi-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}
