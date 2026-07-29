import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { ApiManifest } from "@preactpress/plugin-typedoc/types";
import type { ComponentEntry, ComponentManifest } from "../types/index.js";
import { COMPONENT_MANIFEST_VERSION } from "../types/index.js";
import { componentsFromApiManifest } from "./from-api-manifest.js";
import { extractComponentEntry } from "./typescript.js";

export interface ComponentCatalogItem {
  component?: string;
  source: string;
  exportName: string;
}

export interface BuildComponentManifestOptions {
  root: string;
  configDir: string;
  tsconfig?: string;
  gitRemote?: string;
  gitBranch?: string;
  catalog?: ComponentCatalogItem[];
  apiManifestPath?: string;
}

function hashPayload(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function buildComponentManifest(
  options: BuildComponentManifestOptions,
): Promise<ComponentManifest> {
  const components: Record<string, ComponentEntry> = {};

  if (options.apiManifestPath) {
    try {
      const raw = await fs.readFile(options.apiManifestPath, "utf8");
      const apiManifest = JSON.parse(raw) as ApiManifest;
      Object.assign(components, componentsFromApiManifest(apiManifest));
    } catch {
      /* optional typedoc manifest */
    }
  }

  for (const item of options.catalog ?? []) {
    const entry = extractComponentEntry({
      root: options.root,
      source: item.source,
      exportName: item.exportName,
      tsconfig: options.tsconfig,
      gitRemote: options.gitRemote,
      gitBranch: options.gitBranch,
    });
    components[item.component ?? item.exportName] = entry;
  }

  const sourceHash = hashPayload(
    JSON.stringify({ catalog: options.catalog, keys: Object.keys(components).sort() }),
  );

  return {
    version: COMPONENT_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    sourceHash,
    components,
  };
}

export async function defaultApiManifestPath(configDir: string): Promise<string> {
  return path.join(configDir, "typedoc-manifest.json");
}
