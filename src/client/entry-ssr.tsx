import { renderToString } from 'preact-render-to-string'
import { App } from './app.js'
import { pages } from 'virtual:preactpress-pages'
import { site } from 'virtual:preactpress-site'
import { resolvePageHeadMeta } from '../shared/pageMeta.js'
import type { PageView } from './types.js'

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
  return (
    pages[routePath] ??
    pages['/404'] ?? {
      kind: 'markdown' as const,
      html: '',
      title: 'Not found',
      description: site.description,
      meta: {},
      headings: []
    }
  )
}

export function render(routePath: string): RenderResult {
  const page = resolveRoutePage(routePath)
  const body = renderToString(<App routePath={routePath} initialPage={page} />)
  const head = resolvePageHeadMeta(
    page.kind === 'markdown'
      ? {
          title: page.title,
          description: page.description,
          tags: page.tags,
          image: page.image,
          pageType: page.pageType,
          kind: 'markdown',
          html: page.html
        }
      : {
          title: page.title,
          description: page.description,
          tags: page.tags,
          image: page.image,
          pageType: page.pageType,
          kind: 'mdx'
        },
    site
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
