import type { PageView } from '../client/types.js'
import { siteForRoute } from '../shared/locale.js'
import type { SiteConfig } from './siteConfig.js'

export async function applyTransformPageData(
  site: SiteConfig,
  route: string,
  page: PageView
): Promise<PageView> {
  if (!site.transformPageData) return page
  const activeSite = siteForRoute(site.site, route, site.i18n)
  const next = await site.transformPageData(page, { route, site: activeSite })
  return next ?? page
}

export async function applyTransformHtml(
  site: SiteConfig,
  html: string,
  route: string,
  page?: PageView
): Promise<string> {
  if (!site.transformHtml) return html
  const activeSite = siteForRoute(site.site, route, site.i18n)
  return site.transformHtml(html, { route, site: activeSite, page })
}

export async function invokeBuildEnd(
  site: SiteConfig,
  pages: Array<{ route: string; page: PageView }>
): Promise<void> {
  if (!site.buildEnd) return
  await site.buildEnd({ site, pages })
}
