import { assertConfig, ConfigError } from "./configError.js";
import type {
  AiExportsConfig,
  ApiDocsConfig,
  CheckConfig,
  LocaleConfig,
  OpenApiConfig,
  RedirectEntry,
  RedirectsConfig,
  UserConfig,
  VersionConfig,
  VersionItemConfig,
  VersionsConfig,
  WorkspaceItemConfig,
  WorkspacesConfig,
} from "./siteConfig.js";
import type { PreactPressPlugin } from "./pluginTypes.js";
import { assertUniquePluginNames } from "./pluginRuntime.js";
import {
  parseRedirectsInput,
  isExternalRedirectTarget,
  resolveRedirectsConfig,
} from "./redirects.js";
import { isStructuredVersionsConfig } from "./resolveVersions.js";
import { isStructuredWorkspacesConfig } from "./resolveWorkspaces.js";

const KNOWN_USER_CONFIG_KEYS = new Set([
  "srcDir",
  "srcExclude",
  "cleanUrls",
  "rewrites",
  "ignoreDeadLinks",
  "mpa",
  "lastUpdatedGit",
  "outDir",
  "cacheDir",
  "theme",
  "site",
  "themeConfig",
  "locales",
  "markdown",
  "favicon",
  "head",
  "transformHead",
  "transformPageData",
  "transformHtml",
  "buildEnd",
  "pageReady",
  "build",
  "vite",
  "versions",
  "workspaces",
  "plugins",
  "apiDocs",
  "openapi",
  "ai",
  "redirects",
  "check",
]);

const REDIRECT_STATUS = new Set([301, 302, 307, 308]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateString(value: unknown, path: string): asserts value is string {
  assertConfig(
    typeof value === "string" && value.trim().length > 0,
    "expected a non-empty string",
    path,
  );
}

function validateBoolean(value: unknown, path: string): asserts value is boolean {
  assertConfig(typeof value === "boolean", "expected a boolean", path);
}

function validateRouteLike(value: unknown, path: string): void {
  validateString(value, path);
  assertConfig(String(value).startsWith("/"), 'expected a route starting with "/"', path);
}

function validateStringArray(value: unknown, path: string): asserts value is string[] {
  assertConfig(Array.isArray(value), "expected an array", path);
  value.forEach((entry, index) => validateString(entry, `${path}[${index}]`));
}

function validateRecord(value: unknown, path: string): asserts value is Record<string, unknown> {
  assertConfig(isPlainObject(value), "expected an object", path);
}

function validateSite(user: UserConfig): void {
  if (user.site === undefined) return;
  validateRecord(user.site, "site");
  if (user.site.title !== undefined) validateString(user.site.title, "site.title");
  if (user.site.description !== undefined) {
    assertConfig(
      typeof user.site.description === "string",
      "expected a string",
      "site.description",
    );
  }
  if (user.site.base !== undefined) validateString(user.site.base, "site.base");
  if (user.site.lang !== undefined) validateString(user.site.lang, "site.lang");
  if (user.site.url !== undefined) validateString(user.site.url, "site.url");
  if (user.site.titleTemplate !== undefined && user.site.titleTemplate !== false) {
    validateString(user.site.titleTemplate, "site.titleTemplate");
  }
}

function validateMarkdown(user: UserConfig): void {
  if (user.markdown === undefined) return;
  validateRecord(user.markdown, "markdown");
  for (const key of ["html", "linkify", "typographer", "emoji", "math"] as const) {
    const value = user.markdown[key];
    if (value !== undefined) validateBoolean(value, `markdown.${key}`);
  }
}

function validateBuild(user: UserConfig): void {
  if (user.build === undefined) return;
  validateRecord(user.build, "build");
  for (const key of ["sitemap", "robots"] as const) {
    const value = user.build[key];
    if (value !== undefined) validateBoolean(value, `build.${key}`);
  }
  if (user.build.feed !== undefined) {
    const feed = user.build.feed;
    if (typeof feed === "boolean") return;
    validateRecord(feed, "build.feed");
    if (feed.limit !== undefined) {
      assertConfig(
        typeof feed.limit === "number" && Number.isFinite(feed.limit) && feed.limit > 0,
        "expected a positive number",
        "build.feed.limit",
      );
    }
  }
}

function validateRewrites(user: UserConfig): void {
  if (user.rewrites === undefined) return;
  validateRecord(user.rewrites, "rewrites");
  for (const [alias, source] of Object.entries(user.rewrites)) {
    validateRouteLike(alias, `rewrites.${alias}`);
    validateRouteLike(source, `rewrites.${alias}`);
  }
}

function validateLocaleEntry(key: string, locale: LocaleConfig): void {
  const base = `locales.${key}`;
  assertConfig(isPlainObject(locale), "expected an object", base);
  validateString(locale.label, `${base}.label`);
  if (locale.lang !== undefined) validateString(locale.lang, `${base}.lang`);
  if (locale.link !== undefined) validateString(locale.link, `${base}.link`);
  if (locale.title !== undefined) validateString(locale.title, `${base}.title`);
  if (locale.description !== undefined) {
    assertConfig(
      typeof locale.description === "string",
      "expected a string",
      `${base}.description`,
    );
  }
}

function validateLocales(user: UserConfig): void {
  if (user.locales === undefined) return;
  validateRecord(user.locales, "locales");
  for (const [key, locale] of Object.entries(user.locales)) {
    validateLocaleEntry(key, locale);
  }
}

function validateVersions(user: UserConfig): void {
  if (user.versions === undefined) return;
  if (isStructuredVersionsConfig(user.versions)) {
    validateStructuredVersions(user.versions);
    return;
  }
  validateRecord(user.versions, "versions");
  for (const [key, version] of Object.entries(user.versions)) {
    validateVersionEntry(key, version);
  }
}

function validateStructuredVersions(versions: VersionsConfig): void {
  assertConfig(Array.isArray(versions.items), "expected an items array", "versions.items");
  if (versions.items.length === 0) {
    throw new ConfigError("expected at least one version item", "versions.items");
  }
  if (versions.current !== undefined) validateString(versions.current, "versions.current");
  if (versions.dir !== undefined) validateString(versions.dir, "versions.dir");
  if (versions.currentDir !== undefined) validateString(versions.currentDir, "versions.currentDir");
  if (versions.aliases !== undefined) {
    validateRecord(versions.aliases, "versions.aliases");
    for (const [key, value] of Object.entries(versions.aliases)) {
      validateString(value, `versions.aliases.${key}`);
    }
  }
  if (versions.labels !== undefined) {
    validateRecord(versions.labels, "versions.labels");
    for (const key of ["switcher", "current", "archived", "archivedBanner"] as const) {
      if (versions.labels[key] !== undefined) {
        validateString(versions.labels[key]!, `versions.labels.${key}`);
      }
    }
  }
  versions.items.forEach((item, index) => validateVersionItem(item, index));
}

function validateVersionItem(item: VersionItemConfig, index: number): void {
  const base = `versions.items[${index}]`;
  assertConfig(isPlainObject(item), "expected an object", base);
  validateString(item.value, `${base}.value`);
  validateString(item.label, `${base}.label`);
  if (item.link !== undefined) validateString(item.link, `${base}.link`);
  if (item.srcDir !== undefined) validateString(item.srcDir, `${base}.srcDir`);
  if (item.status !== undefined) {
    assertConfig(
      item.status === "current" || item.status === "archived" || item.status === "beta",
      'expected "current", "archived", or "beta"',
      `${base}.status`,
    );
  }
}

function validateVersionEntry(key: string, version: VersionConfig): void {
  const base = `versions.${key}`;
  assertConfig(isPlainObject(version), "expected an object", base);
  validateString(version.label, `${base}.label`);
  if (version.link !== undefined) validateString(version.link, `${base}.link`);
  if (version.srcDir !== undefined) validateString(version.srcDir, `${base}.srcDir`);
}

function validateWorkspaces(user: UserConfig): void {
  if (user.workspaces === undefined) return;
  if (Array.isArray(user.workspaces)) {
    user.workspaces.forEach((item, index) => validateWorkspaceItem(item, index));
    return;
  }
  if (isStructuredWorkspacesConfig(user.workspaces)) {
    validateStructuredWorkspaces(user.workspaces);
    return;
  }
  throw new ConfigError("expected a workspace array or structured config object", "workspaces");
}

function validateStructuredWorkspaces(workspaces: WorkspacesConfig): void {
  assertConfig(Array.isArray(workspaces.items), "expected an items array", "workspaces.items");
  if (workspaces.items.length === 0) {
    throw new ConfigError("expected at least one workspace item", "workspaces.items");
  }
  if (workspaces.default !== undefined) validateString(workspaces.default, "workspaces.default");
  if (workspaces.versionMode !== undefined) {
    assertConfig(
      workspaces.versionMode === "project" || workspaces.versionMode === "package",
      'expected "project" or "package"',
      "workspaces.versionMode",
    );
  }
  if (workspaces.autoDiscover !== undefined)
    validateBoolean(workspaces.autoDiscover, "workspaces.autoDiscover");
  workspaces.items.forEach((item, index) => validateWorkspaceItem(item, index));
}

function validateWorkspaceItem(item: WorkspaceItemConfig, index: number): void {
  const base = `workspaces.items[${index}]`;
  assertConfig(isPlainObject(item), "expected an object", base);
  validateString(item.name, `${base}.name`);
  validateString(item.id, `${base}.id`);
  validateString(item.root, `${base}.root`);
  if (item.docs !== undefined) validateString(item.docs, `${base}.docs`);
  if (item.packageName !== undefined) validateString(item.packageName, `${base}.packageName`);
  if (item.version !== undefined) validateString(item.version, `${base}.version`);
  if (item.description !== undefined) validateString(item.description, `${base}.description`);
  if (item.repository !== undefined) validateString(item.repository, `${base}.repository`);
  if (item.sourceDir !== undefined) validateString(item.sourceDir, `${base}.sourceDir`);
  if (item.changelog !== undefined) validateString(item.changelog, `${base}.changelog`);
  if (item.link !== undefined) validateString(item.link, `${base}.link`);
}

function validatePlugins(user: UserConfig): void {
  if (user.plugins === undefined) return;
  assertConfig(Array.isArray(user.plugins), "expected an array", "plugins");
  user.plugins.forEach((plugin, index) => validatePlugin(plugin, index));
  assertUniquePluginNames(user.plugins);
}

function validatePlugin(plugin: PreactPressPlugin, index: number): void {
  const base = `plugins[${index}]`;
  assertConfig(isPlainObject(plugin), "expected an object", base);
  validateString(plugin.name, `${base}.name`);
  if (plugin.enforce !== undefined) {
    assertConfig(
      plugin.enforce === "pre" || plugin.enforce === "post",
      'expected "pre" or "post"',
      `${base}.enforce`,
    );
  }
}

function validateApiDocs(value: ApiDocsConfig | false | undefined): void {
  if (value === undefined || value === false) return;
  validateRecord(value, "apiDocs");
  if (value.enabled !== undefined) validateBoolean(value.enabled, "apiDocs.enabled");
  if (value.tsconfig !== undefined) validateString(value.tsconfig, "apiDocs.tsconfig");
  if (value.outDir !== undefined) validateString(value.outDir, "apiDocs.outDir");
}

function validateOpenApi(value: OpenApiConfig | false | undefined): void {
  if (value === undefined || value === false) return;
  validateRecord(value, "openapi");
  if (value.enabled !== undefined) validateBoolean(value.enabled, "openapi.enabled");
  if (value.spec !== undefined) validateString(value.spec, "openapi.spec");
  if (value.base !== undefined) validateString(value.base, "openapi.base");
}

function validateAi(value: AiExportsConfig | false | undefined): void {
  if (value === undefined || value === false) return;
  validateRecord(value, "ai");
  if (value.llmsTxt !== undefined) validateBoolean(value.llmsTxt, "ai.llmsTxt");
  if (value.llmsFullTxt !== undefined) validateBoolean(value.llmsFullTxt, "ai.llmsFullTxt");
  if (value.copyMarkdown !== undefined) validateBoolean(value.copyMarkdown, "ai.copyMarkdown");
  if (value.contextIndex !== undefined) validateBoolean(value.contextIndex, "ai.contextIndex");
  if (value.pageMarkdown !== undefined) validateBoolean(value.pageMarkdown, "ai.pageMarkdown");
  if (value.chunks !== undefined) validateBoolean(value.chunks, "ai.chunks");
  if (value.exclude !== undefined) validateStringArray(value.exclude, "ai.exclude");
  if (value.maxBundleBytes !== undefined) {
    assertConfig(
      typeof value.maxBundleBytes === "number" &&
        Number.isFinite(value.maxBundleBytes) &&
        value.maxBundleBytes > 0,
      "expected a positive number",
      "ai.maxBundleBytes",
    );
  }
}

function validateRedirectEntry(rule: RedirectEntry, index: number): void {
  const base = `redirects[${index}]`;
  assertConfig(isPlainObject(rule), "expected an object", base);
  validateRouteLike(rule.from, `${base}.from`);
  if (isExternalRedirectTarget(rule.to)) {
    validateString(rule.to, `${base}.to`);
  } else {
    validateRouteLike(rule.to, `${base}.to`);
  }
  if (rule.status !== undefined) {
    assertConfig(
      REDIRECT_STATUS.has(rule.status),
      "expected redirect status 301, 302, 307, or 308",
      `${base}.status`,
    );
  }
}

function validateRedirectsConfig(value: RedirectsConfig | undefined): void {
  if (value === undefined) return;
  const parsed = parseRedirectsInput(value);
  parsed.entries.forEach((entry, index) => validateRedirectEntry(entry, index));
  resolveRedirectsConfig(value, []);
}

function validateCheck(value: CheckConfig | undefined): void {
  if (value === undefined) return;
  validateRecord(value, "check");
  if (value.failOnWarnings !== undefined)
    validateBoolean(value.failOnWarnings, "check.failOnWarnings");
  if (value.plugins !== undefined) validateBoolean(value.plugins, "check.plugins");
}

function validateTopLevelTypes(user: UserConfig): void {
  if (user.srcDir !== undefined) validateString(user.srcDir, "srcDir");
  if (user.outDir !== undefined) validateString(user.outDir, "outDir");
  if (user.cacheDir !== undefined) validateString(user.cacheDir, "cacheDir");
  if (user.theme !== undefined) validateString(user.theme, "theme");
  if (user.cleanUrls !== undefined) validateBoolean(user.cleanUrls, "cleanUrls");
  if (user.mpa !== undefined) validateBoolean(user.mpa, "mpa");
  if (user.lastUpdatedGit !== undefined) validateBoolean(user.lastUpdatedGit, "lastUpdatedGit");
  if (user.srcExclude !== undefined) validateStringArray(user.srcExclude, "srcExclude");
  if (user.pageReady !== undefined && user.pageReady !== false) {
    const pageReady = user.pageReady;
    if (pageReady.preloader !== undefined) {
      validateString(pageReady.preloader, "pageReady.preloader");
    }
    if (pageReady.fallbackMs !== undefined) {
      assertConfig(
        typeof pageReady.fallbackMs === "number" && pageReady.fallbackMs >= 0,
        "expected a non-negative number",
        "pageReady.fallbackMs",
      );
    }
    if (pageReady.probe !== undefined && pageReady.probe !== false) {
      validateString(pageReady.probe, "pageReady.probe");
    }
    if (pageReady.stableFrames !== undefined) {
      assertConfig(
        Number.isInteger(pageReady.stableFrames) && pageReady.stableFrames > 0,
        "expected a positive integer",
        "pageReady.stableFrames",
      );
    }
    if (pageReady.maxFrames !== undefined) {
      assertConfig(
        Number.isInteger(pageReady.maxFrames) && pageReady.maxFrames > 0,
        "expected a positive integer",
        "pageReady.maxFrames",
      );
    }
  }
  if (user.vite !== undefined) {
    assertConfig(isPlainObject(user.vite), "expected an object", "vite");
  }
}

function validateUnknownKeys(user: UserConfig): void {
  for (const key of Object.keys(user)) {
    if (!KNOWN_USER_CONFIG_KEYS.has(key)) {
      throw new ConfigError(`unknown option "${key}"`, key);
    }
  }
}

export function validateUserConfig(input: UserConfig): void {
  if (!isPlainObject(input)) {
    throw new ConfigError("config must export a plain object");
  }
  const user = input as UserConfig;
  validateUnknownKeys(user);
  validateTopLevelTypes(user);
  validateSite(user);
  validateMarkdown(user);
  validateBuild(user);
  validateRewrites(user);
  validateLocales(user);
  validateVersions(user);
  validateWorkspaces(user);
  validatePlugins(user);
  validateApiDocs(user.apiDocs);
  validateOpenApi(user.openapi);
  validateAi(user.ai);
  validateRedirectsConfig(user.redirects);
  validateCheck(user.check);
}
