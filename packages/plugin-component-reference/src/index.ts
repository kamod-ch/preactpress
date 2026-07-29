import path from "node:path";
import type { Plugin } from "vite";
import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import type { ComponentManifest } from "./types/index.js";
import {
  buildComponentManifest,
  defaultApiManifestPath,
  type ComponentCatalogItem,
} from "./extract/generate.js";
import {
  componentSearchTags,
  lookupComponent,
  renderComponentReferenceHtml,
} from "./render/html.js";
import { componentManifestVirtualPlugin, writeComponentManifest } from "./vite-manifest-plugin.js";

export interface ComponentReferencePluginOptions {
  /** Pre-built catalog of components to extract statically. */
  catalog?: ComponentCatalogItem[];
  tsconfig?: string;
  gitRemote?: string;
  gitBranch?: string;
  /** Reuse API data produced by @preactpress/plugin-typedoc */
  useTypedocManifest?: boolean;
  typedocManifestPath?: string;
}

const COMPONENT_REFERENCE_RE = /<ComponentReference\b([^>]*)\/>/g;

function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of source.matchAll(/(\w+)=("([^"]*)"|'([^']*)')/g)) {
    attrs[match[1]!] = match[3] ?? match[4] ?? "";
  }
  return attrs;
}

/** Official PreactPress plugin for Preact component prop documentation. */
export function componentReferencePlugin(
  options: ComponentReferencePluginOptions = {},
): PreactPressPlugin {
  let manifestPromise: Promise<ComponentManifest> | undefined;
  let manifestRef: ComponentManifest | undefined;

  const loadManifest = async (root: string, configDir: string) => {
    if (!manifestPromise) {
      manifestPromise = (async () => {
        const apiPath = options.useTypedocManifest
          ? (options.typedocManifestPath ?? (await defaultApiManifestPath(configDir)))
          : options.typedocManifestPath;
        const manifest = await buildComponentManifest({
          root,
          configDir,
          tsconfig: options.tsconfig,
          gitRemote: options.gitRemote,
          gitBranch: options.gitBranch,
          catalog: options.catalog,
          apiManifestPath: apiPath,
        });
        await writeComponentManifest(configDir, manifest);
        manifestRef = manifest;
        return manifest;
      })();
    }
    return manifestPromise;
  };

  return {
    name: "preactpress:component-reference",
    enforce: "pre",

    async config(config) {
      const root = process.cwd();
      const configDir = path.resolve(root, ".preactpress");
      const manifest = await loadManifest(root, configDir);
      const vitePlugin = componentManifestVirtualPlugin(manifest);

      return {
        ...config,
        vite: {
          ...config.vite,
          plugins: [...(config.vite?.plugins ?? []), vitePlugin as Plugin],
        },
      };
    },

    async configResolved(config) {
      await loadManifest(config.root, config.configDir);
      config.logger.info(
        `component-reference: indexed ${Object.keys(manifestRef?.components ?? {}).length} component(s)`,
        { timestamp: true },
      );
    },

    transformMarkdown(source) {
      if (!manifestRef || !source.includes("<ComponentReference")) return undefined;
      const replaced = source.replace(COMPONENT_REFERENCE_RE, (_match, attrSource: string) => {
        const attrs = parseAttributes(attrSource);
        const entry = lookupComponent(manifestRef!, {
          component: attrs.component,
          source: attrs.source,
          exportName: attrs.exportName,
        });
        if (!entry) {
          return `<p class="pp-component-reference-error">Component reference not found.</p>`;
        }
        return renderComponentReferenceHtml(entry);
      });
      return replaced;
    },

    transformPageData(page, ctx) {
      if (!manifestRef || page.kind !== "markdown") return page;
      if (!page.html.includes("pp-component-reference")) return page;

      const tags = new Set(page.tags ?? []);
      for (const entry of Object.values(manifestRef.components)) {
        if (page.html.includes(`component-${entry.name}`)) {
          for (const tag of componentSearchTags(entry)) tags.add(tag);
        }
      }

      return { ...page, tags: [...tags] };
    },
  };
}

export { buildComponentManifest } from "./extract/generate.js";
export { extractComponentEntry } from "./extract/typescript.js";
export { renderComponentReferenceHtml, lookupComponent } from "./render/html.js";
export type { ComponentManifest, ComponentEntry, ComponentProp } from "./types/index.js";
