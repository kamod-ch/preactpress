import path from "node:path";
import fs from "node:fs";
import { createLogger, loadConfigFromFile, type ConfigEnv } from "vite";
import type { ResolvedConfig, UserConfig } from "./siteConfig.js";
import { resolveConfigDir, resolveConfigPath } from "./paths.js";
import { PACKAGE_ROOT } from "./packageRoot.js";
import { resolveFaviconHead } from "./favicon.js";
import { ensurePreactpressLinked } from "./init.js";
import { scanAllContentFiles } from "./content.js";
import { resolveRedirectsConfig } from "./redirects.js";
import {
  applyPluginsConfig,
  applyPluginsConfigResolved,
  normalizePlugins,
} from "./pluginRuntime.js";
import { normalizeBase, resolveSiteConfig } from "./resolveSiteConfig.js";
import { clientAiExportsConfig } from "./configDefaults.js";

function fileExists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function sameProjectRoot(a: string, b: string): boolean {
  const ra = path.resolve(a);
  const rb = path.resolve(b);
  if (ra === rb) return true;
  try {
    return fs.realpathSync(ra) === fs.realpathSync(rb);
  } catch {
    return false;
  }
}

export async function resolveUserConfig(root: string, env: ConfigEnv): Promise<UserConfig> {
  const configPath = resolveConfigPath(root);
  if (!fileExists(configPath)) {
    const resolvedRoot = path.resolve(root);
    const inToolPackage = sameProjectRoot(resolvedRoot, PACKAGE_ROOT);
    const hint = inToolPackage
      ? "You are in the preactpress package (CLI sources), not a content site. From this folder run `pnpm run dev` to start the bundled `templates/default/` site, or `pnpm run preactpress -- init <dir>` to scaffold a new site elsewhere."
      : 'Run "preactpress init" to scaffold a new site.';
    throw new Error(`preactpress: missing config at ${configPath}. ${hint}`);
  }

  await ensurePreactpressLinked(root);

  const loaded = await loadConfigFromFile(env, configPath, root);
  if (!loaded?.config) {
    throw new Error(`preactpress: failed to load config from ${configPath}`);
  }

  const raw = loaded.config as UserConfig & {
    default?: UserConfig | (() => UserConfig | Promise<UserConfig>);
  };
  let user = (raw.default ?? raw) as UserConfig | (() => UserConfig | Promise<UserConfig>);
  if (typeof user === "function") {
    user = await user();
  }
  if (!user || typeof user !== "object") {
    throw new Error("preactpress: config must export a default object or async factory");
  }
  return user;
}

export async function resolveConfig(
  rootArg?: string,
  command: ConfigEnv["command"] = "serve",
  mode: string = "development",
): Promise<ResolvedConfig> {
  const root = path.resolve(rootArg ?? process.cwd());
  const configDir = resolveConfigDir(root);
  const logger = createLogger();
  const user = await resolveUserConfig(root, { command, mode, isPreview: false });
  const mergedUser = await applyPluginsConfig(user, normalizePlugins(user.plugins));
  const config = resolveSiteConfig(mergedUser, { root, configDir, logger }, []);
  try {
    const contentRoutes = (await scanAllContentFiles(config)).map((file) => file.route);
    config.redirects = resolveRedirectsConfig(mergedUser.redirects, contentRoutes);
  } catch {
    // keep redirect defaults from initial resolve
  }
  await applyPluginsConfigResolved(config, config.plugins);
  return config;
}

/** Apply a CLI or runtime base override across site, locales, and default favicon head tags. */
export function applySiteBaseOverride(config: ResolvedConfig, base: string): void {
  const normalized = normalizeBase(base);
  config.site.base = normalized;
  if (config.i18n) {
    for (const locale of config.i18n.locales) {
      locale.site.base = normalized;
    }
  }
  config.head = [
    ...resolveFaviconHead({ base: normalized, favicon: config.favicon, userHead: config.userHead }),
    ...config.userHead,
  ];
}

export function siteConfigToClientJson(config: ResolvedConfig): string {
  return JSON.stringify({
    site: config.site,
    themeConfig: config.themeConfig,
    i18n: config.i18n,
    versions: config.versions,
    workspaces: config.workspaces,
    mpa: config.mpa,
    ai: clientAiExportsConfig(config.ai),
  });
}

/** For SSR: re-resolve config with production mode. */
export async function resolveConfigForBuild(root?: string): Promise<ResolvedConfig> {
  return resolveConfig(root, "build", "production");
}

export { normalizeBase, resolveSiteConfig } from "./resolveSiteConfig.js";
export { PACKAGE_ROOT };
