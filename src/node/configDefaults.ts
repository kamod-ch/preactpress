import type {
  AiExportsConfig,
  ClientAiExportsConfig,
  ApiDocsConfig,
  BuildConfig,
  CheckConfig,
  MarkdownConfig,
  OpenApiConfig,
  ResolvedAiExportsConfig,
  ResolvedApiDocsConfig,
  ResolvedCheckConfig,
  ResolvedOpenApiConfig,
  ResolvedVersions,
  ResolvedWorkspaces,
  SiteData,
} from "./siteConfig.js";

export const DEFAULT_SRC_DIR = ".";
export const DEFAULT_OUT_DIR = "dist";
export const DEFAULT_CACHE_DIR = "node_modules/.preactpress";

export const DEFAULT_SITE: SiteData = {
  title: "PreactPress",
  description: "",
  base: "/",
  lang: "en",
};

export const DEFAULT_MARKDOWN: Required<MarkdownConfig> = {
  html: false,
  linkify: true,
  typographer: true,
  emoji: false,
  math: false,
};

export const DEFAULT_BUILD: Required<BuildConfig> = {
  sitemap: true,
  robots: true,
  feed: false,
};

export const DEFAULT_CHECK: ResolvedCheckConfig = {
  failOnWarnings: false,
  plugins: true,
};

export const EMPTY_RESOLVED_VERSIONS: ResolvedVersions = {
  enabled: false,
  current: "",
  defaultVersionKey: "latest",
  dir: "versions",
  currentDir: "current",
  labels: {
    switcher: "Version",
    current: "Current",
    archived: "Archived",
    archivedBanner:
      "You are viewing documentation for version {label}. See the {currentLabel} docs for the latest version.",
  },
  aliases: {},
  versions: [],
};

export const EMPTY_RESOLVED_WORKSPACES: ResolvedWorkspaces = {
  enabled: false,
  defaultId: "",
  versionMode: "project",
  labels: {
    switcher: "Package",
    version: "Version",
  },
  workspaces: [],
};

export function normalizeBase(base: string): string {
  if (!base.startsWith("/")) base = "/" + base;
  if (base !== "/" && base.endsWith("/")) base = base.replace(/\/+$/, "");
  return base;
}

export function resolveMarkdownConfig(input: MarkdownConfig | undefined): Required<MarkdownConfig> {
  return {
    html: input?.html ?? DEFAULT_MARKDOWN.html,
    linkify: input?.linkify ?? DEFAULT_MARKDOWN.linkify,
    typographer: input?.typographer ?? DEFAULT_MARKDOWN.typographer,
    emoji: input?.emoji ?? DEFAULT_MARKDOWN.emoji,
    math: input?.math ?? DEFAULT_MARKDOWN.math,
  };
}

export function resolveBuildConfig(input: BuildConfig | undefined): Required<BuildConfig> {
  return {
    sitemap: input?.sitemap ?? DEFAULT_BUILD.sitemap,
    robots: input?.robots ?? DEFAULT_BUILD.robots,
    feed: input?.feed ?? DEFAULT_BUILD.feed,
  };
}

export function resolveCheckConfig(input: CheckConfig | undefined): ResolvedCheckConfig {
  return {
    failOnWarnings: input?.failOnWarnings ?? DEFAULT_CHECK.failOnWarnings,
    plugins: input?.plugins ?? DEFAULT_CHECK.plugins,
  };
}

export function resolveApiDocsConfig(
  input: ApiDocsConfig | false | undefined,
): ResolvedApiDocsConfig | false {
  if (input === false || input === undefined) return false;
  return {
    enabled: input.enabled ?? true,
    tsconfig: input.tsconfig,
    outDir: input.outDir ?? "api",
  };
}

export function resolveOpenApiConfig(
  input: OpenApiConfig | false | undefined,
): ResolvedOpenApiConfig | false {
  if (input === false || input === undefined) return false;
  return {
    enabled: input.enabled ?? true,
    spec: input.spec,
    base: normalizeBase(input.base ?? "/api"),
  };
}

const DEFAULT_AI_MAX_BUNDLE_BYTES = 1_500_000;

export function resolveAiExportsConfig(
  input: AiExportsConfig | false | undefined,
): ResolvedAiExportsConfig | false {
  if (input === false || input === undefined) return false;
  return {
    llmsTxt: input.llmsTxt ?? true,
    llmsFullTxt: input.llmsFullTxt ?? true,
    copyMarkdown: input.copyMarkdown ?? true,
    contextIndex: input.contextIndex ?? true,
    pageMarkdown: input.pageMarkdown ?? true,
    exclude: input.exclude ?? ["/404", "/tags/**"],
    maxBundleBytes: input.maxBundleBytes ?? DEFAULT_AI_MAX_BUNDLE_BYTES,
    chunks: input.chunks ?? false,
  };
}

export function clientAiExportsConfig(
  ai: ResolvedAiExportsConfig | false,
): ClientAiExportsConfig | false {
  if (ai === false) return false;
  return { copyMarkdown: ai.copyMarkdown };
}

