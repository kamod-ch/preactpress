import { renderToString } from 'preact-render-to-string'
import { App } from './app.js'
import { pages } from 'virtual:preactpress-pages'
import { i18n, site } from 'virtual:preactpress-site'
import { resolvePageHeadMeta, titleTemplateFromMeta } from '../shared/pageMeta.js'
import type { PageView } from './types.js'
import { siteForRoute } from '../shared/locale.js'

export interface RenderResult {
  body: string
  title: string
  description: string
  tags: string[]
  image?: string
  pageType: 'website' | 'article'
  page: PageView
}

export function resolveRoutePage(routePath: string): PageView {
  const activeSite = siteForRoute(site, routePath, i18n)
  return (
    pages[routePath] ??
    pages['/404'] ?? {
      kind: 'markdown' as const,
      html: '',
      title: 'Not found',
      description: activeSite.description,
      meta: {},
      headings: []
    }
  )
}

function renderResult(routePath: string, page: PageView): RenderResult {
  const body = renderToString(<App routePath={routePath} initialPage={page} />)
  const activeSite = siteForRoute(site, routePath, i18n)
  const head = resolvePageHeadMeta(
    page.kind === 'markdown'
      ? {
          title: page.title,
          titleTemplate: titleTemplateFromMeta(page.meta),
          description: page.description,
          tags: page.tags,
          image: page.image,
          pageType: page.pageType,
          kind: 'markdown',
          html: page.html
        }
      : {
          title: page.title,
          titleTemplate: titleTemplateFromMeta(page.meta),
          description: page.description,
          tags: page.tags,
          image: page.image,
          pageType: page.pageType,
          kind: 'mdx'
        },
    activeSite
  )
  return {
    body,
    title: head.title,
    description: head.description,
    tags: head.tags,
    image: head.image,
    pageType: head.pageType,
    page
  }
}

export function renderFromPage(routePath: string, page: PageView): RenderResult {
  return renderResult(routePath, page)
}

export function render(routePath: string): RenderResult {
  return renderFromPage(routePath, resolveRoutePage(routePath))
}
