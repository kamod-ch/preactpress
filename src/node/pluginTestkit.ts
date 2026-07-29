import { createLogger, type Logger } from "vite";
import type { PageView } from "../client/types.js";
import type { ResolvedConfig, UserConfig } from "./siteConfig.js";
import {
  applyPluginsConfig,
  applyPluginsExtendHead,
  applyPluginsExtendRoutes,
  applyPluginsTransformFence,
  applyPluginsTransformMarkdown,
  applyPluginsTransformPageData,
  createPluginContext,
  invokePluginsBuildEnd,
  invokePluginsBuildStart,
  normalizePlugins,
  sortPlugins,
} from "./pluginRuntime.js";
import type {
  BuildResult,
  PluginContext,
  PreactPressPlugin,
  RouteDefinition,
} from "./pluginTypes.js";

export type {
  BuildResult,
  HeadEntry,
  MarkdownTransformContext,
  PageData,
  PluginContext,
  PreactPressPlugin,
  RouteDefinition,
} from "./pluginTypes.js";
export { PluginError } from "./pluginTypes.js";
export {
  applyPluginsConfig,
  applyPluginsExtendHead,
  applyPluginsExtendRoutes,
  applyPluginsTransformFence,
  applyPluginsTransformMarkdown,
  applyPluginsTransformPageData,
  createPluginContext,
  invokePluginsBuildEnd,
  invokePluginsBuildStart,
  normalizePlugins,
  sortPlugins,
} from "./pluginRuntime.js";

const DEFAULT_SITE: ResolvedConfig["site"] = {
  title: "Plugin test site",
  description: "Test site",
  base: "/",
  lang: "en",
};

export function createTestResolvedConfig(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  const logger = overrides.logger ?? createLogger("warn", { prefix: "[preactpress]" });
  return {
    root: overrides.root ?? "/tmp/preactpress-test",
    srcDir: overrides.srcDir ?? "/tmp/preactpress-test",
    srcExclude: overrides.srcExclude ?? [],
    cleanUrls: overrides.cleanUrls ?? true,
    rewrites: overrides.rewrites ?? {},
    mpa: overrides.mpa ?? false,
    lastUpdatedGit: overrides.lastUpdatedGit ?? false,
    configDir: overrides.configDir ?? "/tmp/preactpress-test/.preactpress",
    outDir: overrides.outDir ?? "/tmp/preactpress-test/dist",
    cacheDir: overrides.cacheDir ?? "/tmp/preactpress-test/.cache",
    theme: overrides.theme ?? "/tmp/preactpress-test/.preactpress/theme/Layout.tsx",
    site: { ...DEFAULT_SITE, ...overrides.site },
    themeConfig: overrides.themeConfig ?? {},
    markdown: overrides.markdown ?? {
      html: false,
      linkify: true,
      typographer: true,
      emoji: false,
      math: false,
    },
    userHead: overrides.userHead ?? [],
    head: overrides.head ?? [],
    pageReady: overrides.pageReady ?? false,
    build: overrides.build ?? { sitemap: true, robots: true, feed: false },
    vite: overrides.vite ?? {},
    logger,
    versions: overrides.versions ?? {
      enabled: false,
      current: "",
      defaultVersionKey: "latest",
      dir: "versions",
      currentDir: "current",
      labels: {
        switcher: "Version",
        current: "Current",
        archived: "Archived",
        archivedBanner: "Archived",
      },
      aliases: {},
      versions: [],
    },
    workspaces: overrides.workspaces ?? {
      enabled: false,
      defaultId: "",
      versionMode: "project",
      labels: { switcher: "Package", version: "Version" },
      workspaces: [],
    },
    plugins: overrides.plugins ?? [],
    apiDocs: overrides.apiDocs ?? false,
    openapi: overrides.openapi ?? false,
    ai: overrides.ai ?? false,
    redirects: overrides.redirects ?? {
      rules: [],
      generateHtmlFallbacks: true,
      generateRedirectsFile: true,
      fromRoutes: new Set<string>(),
    },
    check: overrides.check ?? { failOnWarnings: false, plugins: true },
    ...overrides,
  };
}

export function createTestUserConfig(overrides: Partial<UserConfig> = {}): UserConfig {
  return {
    site: { title: "Plugin test site", description: "Test site" },
    ...overrides,
  };
}

export function createTestPluginContext(
  config?: Partial<ResolvedConfig>,
  overrides?: Partial<PluginContext>,
): PluginContext {
  const resolved = createTestResolvedConfig(config);
  return {
    ...createPluginContext(resolved, overrides),
    ...overrides,
  };
}

export async function runTransformMarkdown(
  plugins: PreactPressPlugin[],
  source: string,
  context: { route: string; file: string; config?: Partial<ResolvedConfig> },
): Promise<string> {
  const config = createTestResolvedConfig({
    plugins: normalizePlugins(plugins),
    ...context.config,
  });
  return applyPluginsTransformMarkdown(config, source, {
    route: context.route,
    file: context.file,
  });
}

export async function runTransformPageData(
  plugins: PreactPressPlugin[],
  page: PageView,
  route: string,
  config?: Partial<ResolvedConfig>,
): Promise<PageView> {
  const resolved = createTestResolvedConfig({ plugins: normalizePlugins(plugins), ...config });
  return applyPluginsTransformPageData(resolved, route, page);
}

export async function runExtendRoutes(
  plugins: PreactPressPlugin[],
  routes: RouteDefinition[],
  config?: Partial<ResolvedConfig>,
): Promise<RouteDefinition[]> {
  const resolved = createTestResolvedConfig({ plugins: normalizePlugins(plugins), ...config });
  return applyPluginsExtendRoutes(resolved, routes);
}

export async function runTransformFence(
  plugins: PreactPressPlugin[],
  lang: string,
  code: string,
  meta: string,
  context: { route: string; file: string; config?: Partial<ResolvedConfig> },
): Promise<string | undefined> {
  const config = createTestResolvedConfig({
    plugins: normalizePlugins(plugins),
    ...context.config,
  });
  return applyPluginsTransformFence(config, lang, code, meta, {
    route: context.route,
    file: context.file,
  });
}

export async function runBuildEnd(
  plugins: PreactPressPlugin[],
  result: BuildResult,
  config?: Partial<ResolvedConfig>,
): Promise<void> {
  const resolved = createTestResolvedConfig({ plugins: normalizePlugins(plugins), ...config });
  await invokePluginsBuildEnd(resolved, result);
}
