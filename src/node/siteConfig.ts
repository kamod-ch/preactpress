import type { Logger } from "vite";
import type { PageView } from "../client/types.js";
import type { PageOutlineConfig, ThemeableImage } from "../shared/pageChrome.js";
import type { SearchConfig } from "../shared/search.js";
import type { SocialLink } from "../shared/socialIcons.js";

export type ThemeLogo = string | ThemeableImage;

export interface NavItem {
  text: string;
  link?: string;
  items?: NavItem[];
}

export interface SidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
}

export interface SidebarGroup {
  text?: string;
  /** When true, the group starts collapsed in the default theme sidebar. */
  collapsed?: boolean;
  items: SidebarItem[];
}

export interface ThemeLabels {
  skip?: string;
  navigation?: string;
  menu?: string;
  closeMenu?: string;
  search?: string;
  filterPages?: string;
  searchResults?: string;
  previous?: string;
  next?: string;
  lastUpdated?: string;
  onThisPage?: string;
  language?: string;
  version?: string;
  archivedBanner?: string;
  copyPageMarkdown?: string;
  copiedPageMarkdown?: string;
}

export interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

export type SidebarConfig = SidebarGroup[] | Record<string, SidebarGroup[]>;

export interface ThemeConfig {
  /** Image URL or light/dark variants for the header logo. */
  logo?: ThemeLogo;
  /** Override default-theme UI strings (merged with built-in EN/DE defaults). */
  labels?: ThemeLabels;
  nav?: NavItem[];
  /** Global sidebar or path-prefix keyed groups (e.g. `{ '/guide/': [...] }`). */
  sidebar?: SidebarConfig;
  outline?: boolean | PageOutlineConfig;
  /** `true` or `{ provider: 'local' }` for sidebar search; `{ provider: 'algolia', options }` for DocSearch. */
  search?: SearchConfig;
  /** Social account links shown in the nav bar. */
  socialLinks?: SocialLink[];
  tags?: boolean;
  footer?: string;
  editLink?: {
    pattern: string;
    text?: string;
  };
  lastUpdated?: boolean;
  /** Optional header CTA (e.g. Protocol-style “Sign in”). */
  signInLink?: {
    text: string;
    link: string;
  };
}

export interface LocaleConfig {
  label: string;
  lang?: string;
  link?: string;
  title?: string;
  description?: string;
  themeConfig?: ThemeConfig;
}

export interface MarkdownConfig {
  html?: boolean;
  linkify?: boolean;
  typographer?: boolean;
  /** Enable `:tada:` emoji shortcodes (default: true). */
  emoji?: boolean;
  /** Enable MathJax rendering for `$…$` and `$$…$$` (default: false). */
  math?: boolean;
}

export interface SiteData {
  title: string;
  description: string;
  base: string;
  lang: string;
  url?: string;
  /** `:title | :siteTitle` by default; set `false` to use the raw page title only. */
  titleTemplate?: string | false;
}

export type HeadTag =
  | ["meta", Record<string, string | boolean | undefined>]
  | ["link", Record<string, string | boolean | undefined>]
  | ["script", Record<string, string | boolean | undefined>, string?];

export interface FaviconConfig {
  /** SVG favicon URL. */
  svg?: string;
  /** PNG favicon URL, usually a large fallback icon. */
  png?: string;
  /** 32×32 PNG favicon URL. */
  png32?: string;
  /** ICO favicon URL. */
  ico?: string;
  /** Apple touch icon URL. */
  apple?: string;
  /** Web app manifest URL. */
  manifest?: string;
  /** Safari pinned tab mask icon URL. */
  maskIcon?: string;
  /** Safari pinned tab mask icon color. */
  maskIconColor?: string;
}

export interface BuildConfig {
  sitemap?: boolean;
  robots?: boolean;
  feed?: boolean | { limit?: number };
}

/**
 * Controls the built-in page-ready preloader injected into HTML documents.
 * Set to `false` to disable. Omit for the default spinner overlay.
 */
export interface PageReadyConfig {
  /**
   * Custom preloader markup. Provide a full element with `id="pp-preloader"`,
   * or inner HTML only (wrapped automatically in the default overlay shell).
   */
  preloader?: string;
  /** Milliseconds before the page is revealed regardless of CSS state. Default `5000`. */
  fallbackMs?: number;
  /**
   * CSS custom property that must be set on `:root` before reveal.
   * Use `false` to skip the probe (stylesheet links only). Default `--pp-bg`.
   */
  probe?: string | false;
  /** Head stylesheet count must be stable for this many frames. Default `4`. */
  stableFrames?: number;
  /** Maximum animation frames to wait before reveal. Default `300`. */
  maxFrames?: number;
}

export interface ResolvedPageReadyConfig {
  preloader: string;
  fallbackMs: number;
  probe: string | false;
  stableFrames: number;
  maxFrames: number;
}

export type IgnoreDeadLinks =
  | boolean
  | string[]
  | ((href: string, ctx: { from: string; route?: string }) => boolean);

export interface TransformPageDataContext {
  route: string;
  site: SiteData;
}

export interface TransformHtmlContext {
  route: string;
  site: SiteData;
  page?: PageView;
}

export interface BuildEndContext {
  site: ResolvedConfig;
  pages: Array<{ route: string; page: PageView }>;
}

/** Legacy documentation version entry keyed by identifier. */
export interface VersionConfig {
  label: string;
  link?: string;
  /** Optional content root relative to the site root. */
  srcDir?: string;
  themeConfig?: ThemeConfig;
}

export type VersionStatus = "current" | "archived" | "beta";

export interface VersionItemConfig {
  value: string;
  label: string;
  status?: VersionStatus;
  link?: string;
  /** Optional content root relative to the site root. */
  srcDir?: string;
  themeConfig?: ThemeConfig;
}

export interface VersionLabels {
  switcher?: string;
  current?: string;
  archived?: string;
  /** Supports `{version}`, `{label}`, `{current}`, `{currentLabel}`. */
  archivedBanner?: string;
}

/** Structured documentation versioning config. */
export interface VersionsConfig {
  /** Version value served at unprefixed routes. Default: first item with `status: "current"`. */
  current?: string;
  /** Alias keys mapped to version values, e.g. `{ latest: "2.0" }`. */
  aliases?: Record<string, string>;
  /** Directory name for archived snapshots. Default `versions`. */
  dir?: string;
  /** Directory name for the current docs tree. Default `current`. */
  currentDir?: string;
  items: VersionItemConfig[];
  labels?: VersionLabels;
}

export type UserVersionsConfig = Record<string, VersionConfig> | VersionsConfig;

export interface ResolvedVersion {
  key: string;
  value: string;
  label: string;
  link: string;
  prefix: string;
  status: VersionStatus;
  isCurrent: boolean;
  isAlias: boolean;
  srcDir: string;
  themeConfig: ThemeConfig;
}

export interface ResolvedVersions {
  enabled: boolean;
  current: string;
  defaultVersionKey: string;
  dir: string;
  currentDir: string;
  labels: Required<VersionLabels>;
  aliases: Record<string, string>;
  versions: ResolvedVersion[];
}

export interface WorkspaceLinkConfig {
  pattern: string;
  text?: string;
}

export interface WorkspaceTypedocConfig {
  entries: string[];
  tsconfig?: string;
  output?: string;
}

export interface WorkspaceItemConfig {
  /** Display name shown in the workspace switcher. */
  name: string;
  /** URL slug and route prefix (e.g. `ui` → `/ui/...`). */
  id: string;
  /** Package root relative to the site root. */
  root: string;
  /** Docs directory relative to the package root. Default `./docs`. */
  docs?: string;
  /** Optional npm package name for auto-discovery matching. */
  packageName?: string;
  /** Override package version from package.json. */
  version?: string;
  description?: string;
  /** Git repository URL override. */
  repository?: string;
  /** Source directory for source links. Default `src`. */
  sourceDir?: string;
  /** Path to CHANGELOG.md relative to package root. */
  changelog?: string;
  link?: string;
  sidebar?: SidebarConfig;
  themeConfig?: ThemeConfig;
  editLink?: WorkspaceLinkConfig;
  sourceLink?: WorkspaceLinkConfig;
  typedoc?: WorkspaceTypedocConfig;
}

export interface WorkspaceLabels {
  switcher?: string;
  version?: string;
}

/** Monorepo documentation config for multiple packages in one site. */
export interface WorkspacesConfig {
  /** Workspace served when visiting unprefixed shared docs. */
  default?: string;
  /** Use package.json version labels when `package`; site versions when `project`. Default `project`. */
  versionMode?: "project" | "package";
  /** Match workspace entries against pnpm/npm/Yarn workspace packages. */
  autoDiscover?: boolean;
  labels?: WorkspaceLabels;
  items: WorkspaceItemConfig[];
}

export interface ResolvedWorkspace {
  id: string;
  name: string;
  prefix: string;
  link: string;
  packageRoot: string;
  docsDir: string;
  /** Site-root-relative path to the docs directory, with trailing slash. */
  docsRelativePrefix: string;
  packageName?: string;
  packageVersion?: string;
  description?: string;
  repositoryUrl?: string;
  changelogPath?: string;
  editLink?: WorkspaceLinkConfig;
  sourceLink?: WorkspaceLinkConfig;
  typedoc?: WorkspaceTypedocConfig;
  themeConfig: ThemeConfig;
  dependencies: string[];
}

export interface ResolvedWorkspaces {
  enabled: boolean;
  defaultId: string;
  versionMode: "project" | "package";
  labels: Required<WorkspaceLabels>;
  workspaces: ResolvedWorkspace[];
}

/**
 * Plugin contract for extending PreactPress. See {@link ./pluginTypes.js} and the plugin guide.
 */
export type { PreactPressPlugin } from "./pluginTypes.js";

/** TypeDoc integration options (reserved). Set to `false` to disable explicitly. */
export interface ApiDocsConfig {
  enabled?: boolean;
  /** Path to a tsconfig file used for API reference generation. */
  tsconfig?: string;
  /** Output directory relative to `srcDir`. Default `api`. */
  outDir?: string;
}

export interface ResolvedApiDocsConfig {
  enabled: boolean;
  tsconfig?: string;
  outDir: string;
}

/** OpenAPI integration options (reserved). Set to `false` to disable explicitly. */
export interface OpenApiConfig {
  enabled?: boolean;
  /** Path to an OpenAPI 3.x spec file. */
  spec?: string;
  /** Route prefix for generated API pages. Default `/api`. */
  base?: string;
}

export interface ResolvedOpenApiConfig {
  enabled: boolean;
  spec?: string;
  base: string;
}

/** AI-oriented export options. Set to `false` to disable explicitly. */
export interface AiExportsConfig {
  /** Write `llms.txt` during production builds. Default `true` when `ai` is set. */
  llmsTxt?: boolean;
  /** Write consolidated `llms-full.txt` (and optional bundles). Default `true` when `ai` is set. */
  llmsFullTxt?: boolean;
  /** Show a “Copy page as Markdown” control in the default theme. Default `true` when `ai` is set. */
  copyMarkdown?: boolean;
  /** Write `/api/context.json` for AI coding tools. Default `true` when `ai` is set. */
  contextIndex?: boolean;
  /** Write per-page `.md` files linked from `llms.txt`. Default `true` when `ai` is set. */
  pageMarkdown?: boolean;
  /** Route globs excluded from AI exports (e.g. `/tags/**`, `/404`). */
  exclude?: string[];
  /** Max bytes for `llms-full.txt` before splitting into numbered bundles. Default `1_500_000`. */
  maxBundleBytes?: number;
  /** Write a JSONL chunk export for retrieval workflows. Default `false`. */
  chunks?: boolean;
}

export interface ResolvedAiExportsConfig {
  llmsTxt: boolean;
  llmsFullTxt: boolean;
  copyMarkdown: boolean;
  contextIndex: boolean;
  pageMarkdown: boolean;
  exclude: string[];
  maxBundleBytes: number;
  chunks: boolean;
}

/** Client-safe subset of AI export settings exposed to the default theme. */
export interface ClientAiExportsConfig {
  copyMarkdown: boolean;
}

/** HTTP redirect status codes supported for static outputs. */
export type RedirectStatus = 301 | 302 | 307 | 308;

export interface RedirectEntry {
  from: string;
  to: string;
  status?: RedirectStatus;
}

export interface RedirectsOptions {
  entries?: Record<string, string> | RedirectEntry[];
  /** Emit static HTML redirect pages at each source route. Default `true`. */
  generateHtmlFallbacks?: boolean;
  /** Emit `_redirects` for Netlify and Cloudflare Pages. Default `true`. */
  generateRedirectsFile?: boolean;
}

/**
 * Redirect configuration.
 * - Route map: `{ "/old": "/new" }`
 * - Rule array: `[{ from, to, status }]`
 * - Options object with `entries` and output flags
 */
export type RedirectsConfig = Record<string, string> | RedirectEntry[] | RedirectsOptions;

export interface ResolvedRedirect {
  from: string;
  to: string;
  status: RedirectStatus;
  /** Final destination after resolving internal redirect chains. */
  target: string;
  /** Whether the destination is an external URL. */
  external: boolean;
}

export interface ResolvedRedirects {
  rules: ResolvedRedirect[];
  generateHtmlFallbacks: boolean;
  generateRedirectsFile: boolean;
  /** Source routes excluded from search, sitemap, and orphan detection. */
  fromRoutes: Set<string>;
}

/** Options for `preactpress check` (partially reserved for future plugin checks). */
export interface CheckConfig {
  /** Treat warnings as errors when running `preactpress check`. */
  failOnWarnings?: boolean;
  /** Run plugin-provided checks when the plugin runtime is available. Default `true`. */
  plugins?: boolean;
}

export interface ResolvedCheckConfig {
  failOnWarnings: boolean;
  plugins: boolean;
}

export interface ResolvedLocale {
  key: string;
  label: string;
  lang: string;
  link: string;
  prefix: string;
  site: SiteData;
  themeConfig: ThemeConfig;
}

export interface ResolvedI18n {
  defaultLocaleKey: string;
  locales: ResolvedLocale[];
}

export interface UserConfig {
  srcDir?: string;
  // Glob patterns (relative to srcDir) excluded from routing.
  srcExclude?: string[];
  /**
   * When true (default), routes emit as `path/index.html` for extensionless URLs.
   * Set false for `path.html` output (e.g. hosts without directory index support).
   */
  cleanUrls?: boolean;
  /** Map public routes to existing content routes, e.g. `{ '/docs': '/guide' }`. */
  rewrites?: Record<string, string>;
  /**
   * Skip dead-link errors in `preactpress check`.
   * `true`, glob patterns (`'/wip/*'`), or a filter function.
   */
  ignoreDeadLinks?: IgnoreDeadLinks;
  /**
   * Multi-page app mode: markdown pages ship without the client bundle and use
   * full page loads. MDX pages still hydrate for interactive components.
   */
  mpa?: boolean;
  /** Use git commit time for lastUpdated when enabled in theme (falls back to file mtime). */
  lastUpdatedGit?: boolean;
  outDir?: string;
  cacheDir?: string;
  /** Path to Layout module (e.g. `./theme/Layout.tsx`) relative to `.preactpress` */
  theme?: string;
  site?: Partial<SiteData>;
  themeConfig?: ThemeConfig;
  locales?: Record<string, LocaleConfig>;
  markdown?: MarkdownConfig;
  /**
   * Convenience favicon config. Use a string for one icon, an object for common variants,
   * `false` to disable built-in favicon tags, or `head` for full manual control.
   */
  favicon?: string | FaviconConfig | false;
  head?: HeadTag[];
  transformHead?: (ctx: {
    route: string;
    title: string;
    description: string;
    tags: string[];
    site: SiteData;
  }) => HeadTag[] | Promise<HeadTag[]>;
  /** Mutate per-page data before SSR and serialization (dev + build). */
  transformPageData?: (
    page: PageView,
    ctx: TransformPageDataContext,
  ) => PageView | void | Promise<PageView | void>;
  /** Transform the final HTML document for a route (dev + build). */
  transformHtml?: (html: string, ctx: TransformHtmlContext) => string | Promise<string>;
  /** Called once after a production build finishes. */
  buildEnd?: (ctx: BuildEndContext) => void | Promise<void>;
  /** Built-in preloader while CSS loads. `false` disables it. */
  pageReady?: false | PageReadyConfig;
  build?: BuildConfig;
  vite?: import("vite").UserConfig;
  /** Documentation versioning (route map or structured config). */
  versions?: UserVersionsConfig;
  /** Monorepo workspace packages aggregated into one documentation site. */
  workspaces?: WorkspacesConfig | WorkspaceItemConfig[];
  /** Registered plugins executed during config resolution, dev, and build. */
  plugins?: import("./pluginTypes.js").PreactPressPlugin[];
  /** TypeDoc integration (reserved). Omit or set `false` to disable. */
  apiDocs?: ApiDocsConfig | false;
  /** OpenAPI integration (reserved). Omit or set `false` to disable. */
  openapi?: OpenApiConfig | false;
  /** AI export settings (reserved). Omit or set `false` to disable. */
  ai?: AiExportsConfig | false;
  /** HTTP redirects. Distinct from in-site route `rewrites`. */
  redirects?: RedirectsConfig;
  /** `preactpress check` behavior. */
  check?: CheckConfig;
}

/** Fully resolved site configuration used by internal build and runtime modules. */
export interface ResolvedConfig {
  root: string;
  srcDir: string;
  srcExclude: string[];
  cleanUrls: boolean;
  rewrites: Record<string, string>;
  ignoreDeadLinks?: IgnoreDeadLinks;
  mpa: boolean;
  lastUpdatedGit: boolean;
  configDir: string;
  outDir: string;
  cacheDir: string;
  theme: string;
  site: SiteData;
  themeConfig: ThemeConfig;
  i18n?: ResolvedI18n;
  markdown: Required<MarkdownConfig>;
  favicon?: UserConfig["favicon"];
  userHead: HeadTag[];
  head: HeadTag[];
  transformHead?: UserConfig["transformHead"];
  transformPageData?: UserConfig["transformPageData"];
  transformHtml?: UserConfig["transformHtml"];
  buildEnd?: UserConfig["buildEnd"];
  pageReady: ResolvedPageReadyConfig | false;
  build: Required<BuildConfig>;
  vite: import("vite").UserConfig;
  logger: Logger;
  routes?: string[];
  versions: ResolvedVersions;
  workspaces: ResolvedWorkspaces;
  plugins: import("./pluginTypes.js").PreactPressPlugin[];
  apiDocs: ResolvedApiDocsConfig | false;
  openapi: ResolvedOpenApiConfig | false;
  ai: ResolvedAiExportsConfig | false;
  redirects: ResolvedRedirects;
  check: ResolvedCheckConfig;
}

/** @deprecated Use {@link ResolvedConfig}. Kept for backward compatibility. */
export type SiteConfig = ResolvedConfig;
