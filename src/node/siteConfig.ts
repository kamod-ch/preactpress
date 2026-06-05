import type { Logger } from 'vite'
import type { PageOutlineConfig, ThemeableImage } from '../shared/pageChrome.js'
import type { SearchConfig } from '../shared/search.js'
import type { SocialLink } from '../shared/socialIcons.js'

export type ThemeLogo = string | ThemeableImage

export interface NavItem {
  text: string
  link?: string
  items?: NavItem[]
}

export interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

export interface SidebarGroup {
  text?: string
  /** When true, the group starts collapsed in the default theme sidebar. */
  collapsed?: boolean
  items: SidebarItem[]
}

export interface ThemeLabels {
  skip?: string
  navigation?: string
  search?: string
  filterPages?: string
  searchResults?: string
  previous?: string
  next?: string
  lastUpdated?: string
  onThisPage?: string
  language?: string
}

export interface OutlineItem {
  id: string
  text: string
  level: number
}

export type SidebarConfig = SidebarGroup[] | Record<string, SidebarGroup[]>

export interface ThemeConfig {
  /** Image URL or light/dark variants for the header logo. */
  logo?: ThemeLogo
  /** Override default-theme UI strings (merged with built-in EN/DE defaults). */
  labels?: ThemeLabels
  nav?: NavItem[]
  /** Global sidebar or path-prefix keyed groups (e.g. `{ '/guide/': [...] }`). */
  sidebar?: SidebarConfig
  outline?: boolean | PageOutlineConfig
  /** `true` or `{ provider: 'local' }` for sidebar search; `{ provider: 'algolia', options }` for DocSearch. */
  search?: SearchConfig
  /** Social account links shown in the nav bar. */
  socialLinks?: SocialLink[]
  tags?: boolean
  footer?: string
  editLink?: {
    pattern: string
    text?: string
  }
  lastUpdated?: boolean
}

export interface LocaleConfig {
  label: string
  lang?: string
  link?: string
  title?: string
  description?: string
  themeConfig?: ThemeConfig
}

export interface MarkdownConfig {
  html?: boolean
  linkify?: boolean
  typographer?: boolean
  /** Enable `:tada:` emoji shortcodes (default: true). */
  emoji?: boolean
  /** Enable MathJax rendering for `$…$` and `$$…$$` (default: false). */
  math?: boolean
}

export interface SiteData {
  title: string
  description: string
  base: string
  lang: string
  url?: string
  /** `:title | :siteTitle` by default; set `false` to use the raw page title only. */
  titleTemplate?: string | false
}

export type HeadTag =
  | ['meta', Record<string, string | boolean | undefined>]
  | ['link', Record<string, string | boolean | undefined>]
  | ['script', Record<string, string | boolean | undefined>, string?]

export interface BuildConfig {
  sitemap?: boolean
  robots?: boolean
  feed?: boolean | { limit?: number }
}

export interface ResolvedLocale {
  key: string
  label: string
  lang: string
  link: string
  prefix: string
  site: SiteData
  themeConfig: ThemeConfig
}

export interface ResolvedI18n {
  defaultLocaleKey: string
  locales: ResolvedLocale[]
}

export interface UserConfig {
  srcDir?: string
  // Glob patterns (relative to srcDir) excluded from routing.
  srcExclude?: string[]
  /**
   * When true (default), routes emit as `path/index.html` for extensionless URLs.
   * Set false for `path.html` output (e.g. hosts without directory index support).
   */
  cleanUrls?: boolean
  /** Map public routes to existing content routes, e.g. `{ '/docs': '/guide' }`. */
  rewrites?: Record<string, string>
  /** Use git commit time for lastUpdated when enabled in theme (falls back to file mtime). */
  lastUpdatedGit?: boolean
  outDir?: string
  cacheDir?: string
  /** Path to Layout module (e.g. `./theme/Layout.tsx`) relative to `.preactpress` */
  theme?: string
  site?: Partial<SiteData>
  themeConfig?: ThemeConfig
  locales?: Record<string, LocaleConfig>
  markdown?: MarkdownConfig
  head?: HeadTag[]
  transformHead?: (ctx: {
    route: string
    title: string
    description: string
    tags: string[]
    site: SiteData
  }) => HeadTag[] | Promise<HeadTag[]>
  build?: BuildConfig
  vite?: import('vite').UserConfig
}

export interface SiteConfig {
  root: string
  srcDir: string
  srcExclude: string[]
  cleanUrls: boolean
  rewrites: Record<string, string>
  lastUpdatedGit: boolean
  configDir: string
  outDir: string
  cacheDir: string
  theme: string
  site: SiteData
  themeConfig: ThemeConfig
  i18n?: ResolvedI18n
  markdown: Required<MarkdownConfig>
  head: HeadTag[]
  transformHead?: UserConfig['transformHead']
  build: Required<BuildConfig>
  vite: import('vite').UserConfig
  logger: Logger
  routes?: string[]
}
