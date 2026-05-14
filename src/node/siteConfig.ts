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

export interface ThemeConfig {
  nav?: NavItem[]
  sidebar?: SidebarGroup[]
}

export interface SiteData {
  title: string
  description: string
  base: string
}

export interface UserConfig {
  srcDir?: string
  outDir?: string
  cacheDir?: string
  /** Path to Layout module (e.g. `./theme/Layout.tsx`) relative to `.preactpress` */
  theme?: string
  site?: Partial<SiteData>
  themeConfig?: ThemeConfig
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
  vite: import('vite').UserConfig
  logger: Logger
}
