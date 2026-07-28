import path from "node:path";
import fs from "node:fs/promises";
import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import { mergePathSidebar } from "@preactpress/plugin-typedoc";
import type { ChangelogGenerationResult, ChangelogPluginOptions } from "./types/index.js";
import {
  generateChangelogDocs,
  writeGeneratedPages,
  writeStructuredManifest,
} from "./extract/generate.js";
import {
  navFromChangelogManifest,
  sidebarFromChangelogManifest,
  versionSidebarsFromManifest,
} from "./render/sidebar.js";
import { renderChangelogAtomFeed } from "./render/rss.js";

export type { ChangelogPluginOptions } from "./types/index.js";
export {
  ChangelogOfflineError,
  ChangelogRateLimitError,
  CHANGELOG_MANIFEST_VERSION,
} from "./types/index.js";
export type {
  ChangelogEntry,
  ChangelogGenerationResult,
  ChangelogManifest,
  ChangelogProviderId,
  ChangelogRelease,
  ChangelogSection,
  ChangelogSectionKind,
  RawChangelogRelease,
} from "./types/index.js";
export { generateChangelogDocs, writeGeneratedPages } from "./extract/generate.js";
export { renderChangelogDocs, renderOverviewPage, renderReleasePage } from "./render/markdown.js";
export {
  sidebarFromChangelogManifest,
  navFromChangelogManifest,
  versionSidebarsFromManifest,
} from "./render/sidebar.js";
export { renderChangelogAtomFeed } from "./render/rss.js";
export {
  resolveProvider,
  githubChangelogProvider,
  localChangelogProvider,
  changesetsChangelogProvider,
} from "./providers/index.js";
export type { ChangelogProvider, ProviderContext } from "./providers/types.js";
export {
  parseKeepAChangelog,
  parseReleaseBody,
  releaseMatchesDocVersion,
} from "./extract/normalize.js";

type NavItemLike = { link?: string; items?: NavItemLike[] };

function hasNavLink(nav: NavItemLike[] | undefined, link: string): boolean {
  if (!nav) return false;
  for (const item of nav) {
    if (item.link === link) return true;
    if (item.items && hasNavLink(item.items, link)) return true;
  }
  return false;
}

/** Official PreactPress plugin for changelog pages from local files, GitHub Releases, or Changesets. */
export function changelogPlugin(options: ChangelogPluginOptions): PreactPressPlugin {
  let generation: Promise<ChangelogGenerationResult> | undefined;
  let lastResult: ChangelogGenerationResult | undefined;

  const runGeneration = (
    root: string,
    srcDir: string,
    cacheDir: string,
    configDir: string,
    versions?: import("@kamod-ch/preactpress/config").ResolvedConfig["versions"],
    force = false,
  ) => {
    if (force) generation = undefined;
    if (!generation) {
      generation = (async () => {
        const result = await generateChangelogDocs(
          { root, srcDir, cacheDir, versions },
          options,
        );
        await writeGeneratedPages(srcDir, result);
        await writeStructuredManifest(configDir, result.manifest);
        lastResult = result;
        return result;
      })();
    }
    return generation;
  };

  const feedEnabled = options.feed !== false;

  return {
    name: "preactpress:changelog",
    enforce: "pre",

    async config(config) {
      const root = process.cwd();
      const srcDir = path.resolve(root, config.srcDir ?? ".");
      const cacheDir = path.resolve(root, config.cacheDir ?? "node_modules/.preactpress");
      const configDir = path.resolve(root, ".preactpress");
      const result = await runGeneration(root, srcDir, cacheDir, configDir);
      const sidebar = sidebarFromChangelogManifest(result.manifest);
      const navLink = navFromChangelogManifest(result.manifest);

      let nextSidebar = mergePathSidebar(
        config.themeConfig?.sidebar,
        result.manifest.baseRoute,
        sidebar,
      );

      return {
        ...config,
        changelog: {
          enabled: true,
          provider: options.provider,
          repository: options.repository,
          route: result.manifest.baseRoute,
        },
        themeConfig: {
          ...config.themeConfig,
          sidebar: nextSidebar,
          nav: hasNavLink(config.themeConfig?.nav, navLink.link)
            ? config.themeConfig?.nav
            : [...(config.themeConfig?.nav ?? []), navLink],
        },
      };
    },

    async configResolved(config) {
      const needsVersionIntegration = options.versionIntegration && config.versions.enabled;
      await runGeneration(
        config.root,
        config.srcDir,
        config.cacheDir,
        config.configDir,
        needsVersionIntegration ? config.versions : undefined,
        needsVersionIntegration,
      );
      if (needsVersionIntegration && lastResult) {
        const prefixes = config.versions.versions
          .filter((entry) => !entry.isAlias && entry.prefix)
          .map((entry) => entry.prefix!.replace(/\/+$/, ""));
        let sidebar = config.themeConfig.sidebar;
        const versionSidebars = versionSidebarsFromManifest(lastResult.manifest, prefixes);
        for (const [pathKey, groups] of Object.entries(versionSidebars)) {
          sidebar = mergePathSidebar(sidebar, pathKey, groups);
        }
        config.themeConfig.sidebar = sidebar;
      }
      config.logger.info(
        `changelog: generated ${lastResult?.manifest.releases.length ?? 0} release(s) under ${options.route ?? "/changelog"} (${options.provider})`,
        { timestamp: true },
      );
    },

    async buildEnd(_result, ctx) {
      if (!feedEnabled || !ctx.config.site.url || !lastResult) return;
      const limit = typeof options.feed === "object" ? options.feed.limit : undefined;
      const xml = renderChangelogAtomFeed(lastResult.manifest, {
        siteUrl: ctx.config.site.url,
        siteTitle: ctx.config.site.title,
        limit,
      });
      const feedRoute = `${lastResult.manifest.baseRoute}/feed.xml`.replace(/\/+/g, "/");
      const feedPath = path.join(ctx.outDir, feedRoute.replace(/^\//, ""));
      await fs.mkdir(path.dirname(feedPath), { recursive: true });
      await fs.writeFile(feedPath, xml, "utf8");
      ctx.logger.info(`changelog: wrote RSS feed at ${feedRoute}`, { timestamp: true });
    },
  };
}
