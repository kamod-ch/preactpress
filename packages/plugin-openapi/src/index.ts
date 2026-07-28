import path from "node:path";
import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import { mergePathSidebar } from "@preactpress/plugin-typedoc";
import type { OpenApiGenerateOptions } from "./extract/generate.js";
import {
  generateOpenApiDocs,
  writeGeneratedPages,
  writeStructuredManifest,
} from "./extract/generate.js";
import { navFromOpenApiManifest, sidebarFromOpenApiManifest } from "./render/sidebar.js";
import type { OpenApiExplorerAdapter } from "./explorer/types.js";
import { disabledExplorerAdapter } from "./explorer/types.js";

export interface OpenApiPluginOptions extends OpenApiGenerateOptions {
  /** Reserved adapter hook for a future interactive API explorer. */
  explorer?: OpenApiExplorerAdapter;
}

type NavItemLike = { link?: string; items?: NavItemLike[] };

function hasNavLink(nav: NavItemLike[] | undefined, link: string): boolean {
  if (!nav) return false;
  for (const item of nav) {
    if (item.link === link) return true;
    if (item.items && hasNavLink(item.items, link)) return true;
  }
  return false;
}

/** Official PreactPress plugin for OpenAPI 3.x documentation pages. */
export function openapiPlugin(options: OpenApiPluginOptions): PreactPressPlugin {
  if (!options.input) {
    throw new Error("openapiPlugin(options): `input` must point to a local OpenAPI file or an explicit remote URL.");
  }

  const explorer = options.explorer ?? disabledExplorerAdapter;
  let generation: ReturnType<typeof generateOpenApiDocs> | undefined;

  const runGeneration = (root: string, srcDir: string, cacheDir: string, configDir: string) => {
    if (!generation) {
      generation = (async () => {
        const result = await generateOpenApiDocs({ root, srcDir, cacheDir }, options);
        await writeGeneratedPages(srcDir, result);
        await writeStructuredManifest(configDir, result.manifest);
        return result;
      })();
    }
    return generation;
  };

  return {
    name: "preactpress:openapi",
    enforce: "pre",

    async config(config) {
      const root = process.cwd();
      const srcDir = path.resolve(root, config.srcDir ?? ".");
      const cacheDir = path.resolve(root, config.cacheDir ?? "node_modules/.preactpress");
      const configDir = path.resolve(root, ".preactpress");
      const result = await runGeneration(root, srcDir, cacheDir, configDir);
      const sidebar = sidebarFromOpenApiManifest(result.manifest);
      const navLink = navFromOpenApiManifest(result.manifest);
      const baseRoute = result.manifest.baseRoute;

      return {
        ...config,
        openapi: {
          enabled: true,
          spec: typeof options.input === "string" ? options.input : options.input.url,
          base: baseRoute,
        },
        themeConfig: {
          ...config.themeConfig,
          sidebar: mergePathSidebar(config.themeConfig?.sidebar, baseRoute, sidebar),
          nav: hasNavLink(config.themeConfig?.nav, navLink.link)
            ? config.themeConfig?.nav
            : [...(config.themeConfig?.nav ?? []), navLink],
        },
      };
    },

    async configResolved(config) {
      await runGeneration(config.root, config.srcDir, config.cacheDir, config.configDir);
      config.logger.info(
        `openapi: generated docs for ${typeof options.input === "string" ? options.input : options.input.url} under ${resultRoute(options)}${explorer.enabled ? " (explorer adapter registered)" : ""}`,
        { timestamp: true },
      );
    },
  };
}

function resultRoute(options: OpenApiPluginOptions): string {
  const route = options.route ?? "/api";
  return route.replace(/^\/+/, "");
}

export { generateOpenApiDocs, writeGeneratedPages } from "./extract/generate.js";
export { renderOpenApiDocs } from "./render/markdown.js";
export type {
  OpenApiManifest,
  OpenApiOperation,
  OpenApiSchema,
  OpenApiGenerationResult,
} from "./types/index.js";
export type { OpenApiExplorerAdapter, ExplorerRequest, ExplorerResponse } from "./explorer/types.js";
export { disabledExplorerAdapter } from "./explorer/types.js";
