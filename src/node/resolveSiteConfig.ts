import fs from "node:fs";
import path from "node:path";
import { normalizePath, type Logger } from "vite";
import {
  DEFAULT_CACHE_DIR,
  DEFAULT_OUT_DIR,
  DEFAULT_SITE,
  DEFAULT_SRC_DIR,
  EMPTY_RESOLVED_VERSIONS,
  normalizeBase,
  resolveAiExportsConfig,
  resolveApiDocsConfig,
  resolveBuildConfig,
  resolveCheckConfig,
  resolveMarkdownConfig,
  resolveOpenApiConfig,
} from "./configDefaults.js";
import { resolveRedirectsConfig } from "./redirects.js";
import { resolveVersionsConfig } from "./resolveVersions.js";
import { resolveWorkspacesConfig } from "./resolveWorkspaces.js";
import { resolveFaviconHead } from "./favicon.js";
import { resolveLocales } from "../shared/locale.js";
import { resolvePageReadyConfig } from "../shared/pageReady.js";
import { DEFAULT_THEME_LAYOUT } from "./packageRoot.js";
import type { ResolvedConfig, ThemeConfig, UserConfig } from "./siteConfig.js";
import { resolveRegisteredPlugins } from "./pluginRuntime.js";
import { validateUserConfig } from "./validateUserConfig.js";

export { normalizeBase } from "./configDefaults.js";

export interface ResolveSiteConfigContext {
  root: string;
  configDir: string;
  logger: Logger;
}

function fileExists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function resolveThemeLayout(root: string, configDir: string, theme: string): string {
  const abs = path.isAbsolute(theme) ? theme : path.resolve(configDir, theme);
  if (!fileExists(abs)) {
    throw new Error(`preactpress: theme Layout not found: ${abs}`);
  }
  return normalizePath(abs);
}

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Resolve a validated user config into the internal runtime configuration shape. */
export function resolveSiteConfig(
  user: UserConfig,
  ctx: ResolveSiteConfigContext,
  contentRoutes: string[] = [],
): ResolvedConfig {
  validateUserConfig(user);

  const srcDir = normalizePath(path.resolve(ctx.root, user.srcDir ?? DEFAULT_SRC_DIR));
  const outDir = normalizePath(path.resolve(ctx.root, user.outDir ?? DEFAULT_OUT_DIR));
  const cacheDir = normalizePath(path.resolve(ctx.root, user.cacheDir ?? DEFAULT_CACHE_DIR));

  const site = {
    title: user.site?.title ?? DEFAULT_SITE.title,
    description: user.site?.description ?? DEFAULT_SITE.description,
    base: normalizeBase(user.site?.base ?? DEFAULT_SITE.base),
    lang: user.site?.lang ?? DEFAULT_SITE.lang,
    url: user.site?.url ? normalizeSiteUrl(user.site.url) : undefined,
    titleTemplate: user.site?.titleTemplate,
  };

  const themeConfig = user.themeConfig ?? {};
  const markdown = resolveMarkdownConfig(user.markdown);
  const themePath = user.theme ?? DEFAULT_THEME_LAYOUT;
  const theme = resolveThemeLayout(ctx.root, ctx.configDir, themePath);
  const userHead = user.head ?? [];

  return {
    root: ctx.root,
    srcDir,
    srcExclude: user.srcExclude ?? [],
    cleanUrls: user.cleanUrls ?? true,
    rewrites: user.rewrites ?? {},
    ignoreDeadLinks: user.ignoreDeadLinks,
    mpa: user.mpa ?? false,
    lastUpdatedGit: user.lastUpdatedGit ?? false,
    configDir: ctx.configDir,
    outDir,
    cacheDir,
    theme,
    site,
    themeConfig,
    i18n: resolveLocales(user.locales, site, themeConfig),
    markdown,
    favicon: user.favicon,
    userHead,
    head: [
      ...resolveFaviconHead({ base: site.base, favicon: user.favicon, userHead }),
      ...userHead,
    ],
    transformHead: user.transformHead,
    transformPageData: user.transformPageData,
    transformHtml: user.transformHtml,
    buildEnd: user.buildEnd,
    pageReady: resolvePageReadyConfig(user.pageReady),
    build: resolveBuildConfig(user.build),
    vite: user.vite ?? {},
    logger: ctx.logger,
    versions: resolveVersionsConfig(user.versions, { root: ctx.root, srcDir, themeConfig }),
    workspaces: resolveWorkspacesConfig(user.workspaces, {
      root: ctx.root,
      configDir: ctx.configDir,
      themeConfig,
    }),
    plugins: resolveRegisteredPlugins(user),
    apiDocs: resolveApiDocsConfig(user.apiDocs),
    openapi: resolveOpenApiConfig(user.openapi),
    ai: resolveAiExportsConfig(user.ai),
    redirects: resolveRedirectsConfig(user.redirects, contentRoutes),
    check: resolveCheckConfig(user.check),
  };
}
