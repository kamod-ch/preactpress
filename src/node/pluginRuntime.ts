import type { Logger } from "vite";
import type { PageView } from "../client/types.js";
import type { ResolvedConfig, UserConfig } from "./siteConfig.js";
import { siteForRoute } from "../shared/locale.js";
import type {
  BuildResult,
  FenceTransformContext,
  HeadEntry,
  MarkdownTransformContext,
  PluginContext,
  PreactPressPlugin,
  RouteDefinition,
} from "./pluginTypes.js";
import { PluginError } from "./pluginTypes.js";
import { aiExportsPlugin } from "./plugins/llmsTxt.js";

type EnforceRank = 0 | 1 | 2;

function enforceRank(plugin: PreactPressPlugin): EnforceRank {
  if (plugin.enforce === "pre") return 0;
  if (plugin.enforce === "post") return 2;
  return 1;
}

export function sortPlugins(plugins: PreactPressPlugin[]): PreactPressPlugin[] {
  return [...plugins].sort((a, b) => {
    const rank = enforceRank(a) - enforceRank(b);
    if (rank !== 0) return rank;
    return a.name.localeCompare(b.name);
  });
}

export function assertUniquePluginNames(plugins: PreactPressPlugin[]): void {
  const seen = new Set<string>();
  for (const plugin of plugins) {
    if (seen.has(plugin.name)) {
      throw new PluginError(plugin.name, `duplicate plugin name "${plugin.name}"`);
    }
    seen.add(plugin.name);
  }
}

export function normalizePlugins(plugins: PreactPressPlugin[] | undefined): PreactPressPlugin[] {
  const list = plugins ?? [];
  assertUniquePluginNames(list);
  return sortPlugins(list);
}

export function createPluginContext(
  config: ResolvedConfig,
  overrides?: Partial<Pick<PluginContext, "command" | "mode">>,
): PluginContext {
  return Object.freeze({
    config,
    root: config.root,
    outDir: config.outDir,
    logger: config.logger,
    command: overrides?.command ?? "build",
    mode: overrides?.mode ?? "production",
  });
}

async function runHook<T>(
  plugin: PreactPressPlugin,
  hook: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new PluginError(plugin.name, `${hook} failed: ${message}`, { cause: err });
  }
}

function cloneUserConfigForPlugins(user: UserConfig): UserConfig {
  const {
    plugins: _plugins,
    transformHtml: _transformHtml,
    transformHead: _transformHead,
    transformPageData: _transformPageData,
    buildEnd: _buildEnd,
    ignoreDeadLinks: _ignoreDeadLinks,
    ...cloneable
  } = user;
  return structuredClone(cloneable) as UserConfig;
}

export async function applyPluginsConfig(
  user: UserConfig,
  plugins: PreactPressPlugin[],
  root: string = process.cwd(),
): Promise<UserConfig> {
  let current = user;
  for (const plugin of plugins) {
    if (!plugin.config) continue;
    const next = await runHook(plugin, "config", () =>
      plugin.config!(cloneUserConfigForPlugins(current), { root }),
    );
    if (next !== undefined) {
      const vitePlugins = [...(current.vite?.plugins ?? []), ...(next.vite?.plugins ?? [])];
      current = {
        ...current,
        ...next,
        plugins: current.plugins,
        vite: {
          ...current.vite,
          ...next.vite,
          ...(vitePlugins.length ? { plugins: vitePlugins } : {}),
        },
      };
    }
  }
  return current;
}

export async function applyPluginsConfigResolved(
  config: ResolvedConfig,
  plugins: PreactPressPlugin[],
): Promise<void> {
  for (const plugin of plugins) {
    if (!plugin.configResolved) continue;
    await runHook(plugin, "configResolved", () => plugin.configResolved!(config));
  }
}

export async function invokePluginsBuildStart(
  config: ResolvedConfig,
  context?: Partial<Pick<PluginContext, "command" | "mode">>,
): Promise<void> {
  const ctx = createPluginContext(config, context);
  for (const plugin of config.plugins ?? []) {
    if (!plugin.buildStart) continue;
    await runHook(plugin, "buildStart", () => plugin.buildStart!(ctx));
  }
}

export async function invokePluginsBuildEnd(
  config: ResolvedConfig,
  result: BuildResult,
  context?: Partial<Pick<PluginContext, "command" | "mode">>,
): Promise<void> {
  const ctx = createPluginContext(config, context);
  for (const plugin of config.plugins ?? []) {
    if (!plugin.buildEnd) continue;
    await runHook(plugin, "buildEnd", () => plugin.buildEnd!(result, ctx));
  }
}

export async function applyPluginsExtendRoutes(
  config: ResolvedConfig,
  routes: RouteDefinition[],
  context?: Partial<Pick<PluginContext, "command" | "mode">>,
): Promise<RouteDefinition[]> {
  const ctx = createPluginContext(config, context);
  let current = routes.map((route) => ({ ...route }));
  for (const plugin of config.plugins ?? []) {
    if (!plugin.extendRoutes) continue;
    const next = await runHook(plugin, "extendRoutes", () => plugin.extendRoutes!(current, ctx));
    if (next !== undefined) {
      current = next.map((route) => ({ ...route }));
    }
  }
  return current;
}

export async function applyPluginsTransformMarkdown(
  config: ResolvedConfig,
  source: string,
  context: Omit<MarkdownTransformContext, keyof PluginContext> & Partial<PluginContext>,
): Promise<string> {
  const ctx: MarkdownTransformContext = {
    ...createPluginContext(config, context),
    route: context.route,
    file: context.file,
  };
  let current = source;
  for (const plugin of config.plugins ?? []) {
    if (!plugin.transformMarkdown) continue;
    const next = await runHook(plugin, "transformMarkdown", () =>
      plugin.transformMarkdown!(current, ctx),
    );
    if (next !== undefined) {
      current = next;
    }
  }
  return current;
}

export async function applyPluginsTransformPageData(
  config: ResolvedConfig,
  route: string,
  page: PageView,
  context?: Partial<Pick<PluginContext, "command" | "mode">>,
): Promise<PageView> {
  const ctx = {
    ...createPluginContext(config, context),
    route,
  };
  let current = page;
  for (const plugin of config.plugins ?? []) {
    if (!plugin.transformPageData) continue;
    const next = await runHook(plugin, "transformPageData", () =>
      plugin.transformPageData!(current, ctx),
    );
    if (next !== undefined) {
      current = next;
    }
  }
  return current;
}

export async function applyPluginsExtendHead(
  config: ResolvedConfig,
  route: string,
  page: PageView | undefined,
  context?: Partial<Pick<PluginContext, "command" | "mode">>,
): Promise<HeadEntry[]> {
  if (!page) return [];
  const ctx = {
    ...createPluginContext(config, context),
    route,
  };
  const tags: HeadEntry[] = [];
  for (const plugin of config.plugins ?? []) {
    if (!plugin.extendHead) continue;
    const next = await runHook(plugin, "extendHead", () => plugin.extendHead!(page, ctx));
    if (next?.length) tags.push(...next);
  }
  return tags;
}

/** Map legacy config hooks to a post plugin so ordering stays deterministic. */
export function createLegacyConfigHooksPlugin(
  user: Pick<UserConfig, "transformHead" | "transformPageData" | "buildEnd">,
): PreactPressPlugin | undefined {
  if (!user.transformHead && !user.transformPageData && !user.buildEnd) return undefined;
  return {
    name: "preactpress:config-hooks",
    enforce: "post",
    transformPageData: user.transformPageData
      ? (page, ctx) => {
          const activeSite = siteForRoute(ctx.config.site, ctx.route, ctx.config.i18n);
          return user.transformPageData!(page, { route: ctx.route, site: activeSite });
        }
      : undefined,
    extendHead: user.transformHead
      ? (page, ctx) => {
          const activeSite = siteForRoute(ctx.config.site, ctx.route, ctx.config.i18n);
          return user.transformHead!({
            route: ctx.route,
            title: page.title ?? "",
            description: page.description ?? "",
            tags: page.tags ?? [],
            site: activeSite,
          });
        }
      : undefined,
    buildEnd: user.buildEnd
      ? (result, ctx) => user.buildEnd!({ site: ctx.config, pages: result.pages })
      : undefined,
  };
}

export function resolveRegisteredPlugins(user: UserConfig): PreactPressPlugin[] {
  const plugins = [...(user.plugins ?? [])];
  const legacy = createLegacyConfigHooksPlugin(user);
  if (legacy) plugins.push(legacy);
  const aiEnabled = user.ai !== false && user.ai !== undefined;
  const hasAiPlugin = plugins.some(
    (plugin) => plugin.name === "preactpress:ai-exports" || plugin.name === "preactpress:llms-txt",
  );
  if (aiEnabled && !hasAiPlugin) plugins.push(aiExportsPlugin());
  return normalizePlugins(plugins);
}

export async function applyPluginsTransformFence(
  config: ResolvedConfig,
  lang: string,
  code: string,
  meta: string,
  context: Omit<FenceTransformContext, keyof PluginContext> & Partial<PluginContext>,
): Promise<string | undefined> {
  const ctx: FenceTransformContext = {
    ...createPluginContext(config, context),
    route: context.route,
    file: context.file,
  };
  for (const plugin of config.plugins ?? []) {
    if (!plugin.transformFence) continue;
    const next = await runHook(plugin, "transformFence", () =>
      plugin.transformFence!(lang, code, meta, ctx),
    );
    if (next !== undefined) {
      return next;
    }
  }
  return undefined;
}

export function collectPluginClientModules(plugins: PreactPressPlugin[]): Array<{
  name: string;
  client: string;
}> {
  return (plugins ?? [])
    .filter((plugin): plugin is PreactPressPlugin & { client: string } => Boolean(plugin.client))
    .map((plugin) => ({ name: plugin.name, client: plugin.client }));
}

export type { Logger };
