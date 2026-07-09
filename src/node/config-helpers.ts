import type { UserConfig } from "./siteConfig.js";
export type { FaviconConfig, HeadTag, UserConfig } from "./siteConfig.js";

export type UserConfigExport = UserConfig | (() => UserConfig | Promise<UserConfig>);

export function defineConfig(config: UserConfig): UserConfig;
export function defineConfig(
  config: () => UserConfig | Promise<UserConfig>,
): () => UserConfig | Promise<UserConfig>;
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
