import type { OutlineItem, SiteData, ThemeConfig } from '../node/siteConfig.js'

export interface PageView {
  html: string
  title?: string
  description?: string
  meta: Record<string, unknown>
  headings: OutlineItem[]
}

export interface LayoutProps {
  site: SiteData
  themeConfig: ThemeConfig
  routePath: string
  page?: PageView
}
