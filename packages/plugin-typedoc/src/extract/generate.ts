import fs from "node:fs/promises";
import path from "node:path";
import type { ResolvedConfig } from "@kamod-ch/preactpress/config";
import type { ApiGenerationResult, ApiManifest } from "../types/index.js";
import { computeSourceHash, readCache, writeCache } from "./cache.js";
import { convertTypeDocProject } from "./transform.js";
import { resolveTsconfig, validateEntryPoints } from "./validate.js";
import { renderApiDocs } from "../render/markdown.js";

export interface TypedocGenerateOptions {
  entries: string[];
  output?: string;
  tsconfig?: string;
  includePrivate?: boolean;
  sourceLinks?: boolean;
  gitRemote?: string;
  gitBranch?: string;
  groupBy?: "module" | "kind";
  cache?: boolean;
}

function normalizeBaseRoute(output: string): string {
  return `/${output.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

export async function generateApiReference(
  config: Pick<ResolvedConfig, "root" | "srcDir" | "cacheDir">,
  options: TypedocGenerateOptions,
): Promise<ApiGenerationResult> {
  if (!options.entries?.length) {
    throw new Error("typedocPlugin: at least one entry point is required.");
  }

  validateEntryPoints(config.root, options.entries);
  const tsconfig = resolveTsconfig(config.root, options.tsconfig);
  const outputDir = options.output ?? "reference/api";
  const baseRoute = normalizeBaseRoute(outputDir);
  const includePrivate = options.includePrivate ?? false;
  const sourceHash = await computeSourceHash(
    config.root,
    options.entries,
    tsconfig,
    includePrivate,
  );

  const cacheDir = path.join(config.cacheDir, "typedoc");
  const cached = await readCache({ cacheDir, enabled: options.cache !== false }, sourceHash);
  const manifest =
    cached ??
    (await convertTypeDocProject({
      root: config.root,
      entries: options.entries,
      tsconfig,
      includePrivate,
      sourceHash,
      baseRoute,
      outputDir,
      sourceLinks: options.sourceLinks ?? false,
      gitRemote: options.gitRemote,
      gitBranch: options.gitBranch,
      groupBy: options.groupBy ?? "module",
    }));

  if (!cached) {
    await writeCache({ cacheDir, enabled: options.cache !== false }, sourceHash, manifest);
  }

  return renderApiDocs(manifest);
}

export async function writeGeneratedPages(
  srcDir: string,
  result: ApiGenerationResult,
): Promise<void> {
  for (const page of result.pages) {
    const abs = path.join(srcDir, page.relativePath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, page.markdown, "utf8");
  }

  const manifestPath = path.join(srcDir, result.manifest.outputDir, ".api-manifest.json");
  await fs.writeFile(manifestPath, `${JSON.stringify(result.manifest, null, 2)}\n`, "utf8");
}

export async function writeStructuredManifest(
  configDir: string,
  manifest: ApiManifest,
): Promise<void> {
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "typedoc-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}
