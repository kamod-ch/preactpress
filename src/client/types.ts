import type { SiteData, ThemeConfig } from '../node/siteConfig.js'

export interface PageView {
  html: string
  title?: string
  description?: string
  meta: Record<string, unknown>
}

export interface LayoutProps {
  site: SiteData
  themeConfig: ThemeConfig
  routePath: string
  page?: PageView
}
