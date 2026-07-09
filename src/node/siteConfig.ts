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
  site: SiteConfig;
  pages: Array<{ route: string; page: PageView }>;
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
  build?: BuildConfig;
  vite?: import("vite").UserConfig;
}

export interface SiteConfig {
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
  build: Required<BuildConfig>;
  vite: import("vite").UserConfig;
  logger: Logger;
  routes?: string[];
}
