import type { UserConfig } from "./siteConfig.js";
export type {
  AiExportsConfig,
  ApiDocsConfig,
  CheckConfig,
  FaviconConfig,
  HeadTag,
  OpenApiConfig,
  PageReadyConfig,
  PreactPressPlugin,
  RedirectEntry,
  RedirectsConfig,
  RedirectsOptions,
  ResolvedAiExportsConfig,
  ResolvedApiDocsConfig,
  ResolvedCheckConfig,
  ResolvedConfig,
  ResolvedOpenApiConfig,
  ResolvedRedirect,
  ResolvedRedirects,
  ResolvedVersion,
  ResolvedVersions,
  UserConfig,
  VersionConfig,
  VersionItemConfig,
  VersionsConfig,
  UserVersionsConfig,
} from "./siteConfig.js";
export type {
  BuildResult,
  ClientPlugin,
  FenceTransformContext,
  HeadEntry,
  MarkdownTransformContext,
  PageData,
  PluginContext,
  RouteDefinition,
} from "./pluginTypes.js";
export { PluginError } from "./pluginTypes.js";
export {
  examplePlugin,
  aiExportsPlugin,
  llmsTxtPlugin,
  redirectsPlugin,
} from "./plugins/index.js";

export type UserConfigExport = UserConfig | (() => UserConfig | Promise<UserConfig>);

export function defineConfig<T extends UserConfig>(config: T): T;
export function defineConfig<T extends UserConfig>(
  config: () => T | Promise<T>,
): () => T | Promise<T>;
export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config;
}

export { createContentLoader } from "./createContentLoader.js";
export type { ContentItem, ContentLoader } from "./createContentLoader.js";
export type {
  ArticleFrontmatter,
  ArticlePost,
  Author,
  ContentCategory,
  PageFrontmatter,
  PageLayout,
  PageMetaInput,
} from "../shared/index.js";
