import { glob } from "tinyglobby";
import { loadSiteModuleExports } from "../loadSiteModuleExports.js";
import type { SiteConfig } from "../siteConfig.js";
import { isCollectionDefinition } from "./defineCollection.js";
import type { CollectionDefinition } from "./types.js";

function registerCollection(
  registry: Map<string, CollectionDefinition>,
  name: string,
  value: CollectionDefinition,
  source: string,
): void {
  if (registry.has(name)) {
    throw new Error(`preactpress: Duplicate collection "${name}" registered in ${source}`);
  }
  registry.set(name, { ...value, name });
}

/** Discover collections exported from `content.config.ts` and `*.collection.ts`. */
export async function resolveCollectionRegistry(
  site: SiteConfig,
): Promise<Map<string, CollectionDefinition>> {
  const configFiles = await glob(["content.config.ts", "**/*.collection.ts"], {
    cwd: site.srcDir,
    absolute: true,
    ignore: ["**/node_modules/**", "**/.preactpress/**", ...(site.srcExclude ?? [])],
  });

  const registry = new Map<string, CollectionDefinition>();

  for (const file of configFiles.sort()) {
    const mod = await loadSiteModuleExports(file, site.root);

    for (const [key, value] of Object.entries(mod)) {
      if (key === "default") continue;
      if (isCollectionDefinition(value)) {
        registerCollection(registry, key, value, file);
      }
    }

    const defaultExport = mod.default;
    if (
      defaultExport &&
      typeof defaultExport === "object" &&
      !isCollectionDefinition(defaultExport)
    ) {
      for (const [key, value] of Object.entries(defaultExport as Record<string, unknown>)) {
        if (isCollectionDefinition(value)) {
          registerCollection(registry, key, value, file);
        }
      }
    }
  }

  return registry;
}
