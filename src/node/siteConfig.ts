import type { Logger } from 'vite'

export interface NavItem {
  text: string
  link: string
}

export interface SidebarItem {
  text: string
  link: string
}

export interface SidebarGroup {
  text?: string
  items: SidebarItem[]
}

export interface OutlineItem {
  id: string
  text: string
  level: number
}

export interface ThemeConfig {
  /** Image URL for the header logo (site-relative path or absolute http(s) URL). */
  logo?: string
  nav?: NavItem[]
  sidebar?: SidebarGroup[]
  outline?: boolean
  search?: boolean
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
}

export interface SiteData {
  title: string
  description: string
  base: string
  lang: string
  url?: string
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
