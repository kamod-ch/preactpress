import { renderToString } from 'preact-render-to-string'
import { App } from './app.js'
import { pages } from 'virtual:preactpress-pages'
import { site } from 'virtual:preactpress-site'
import { resolvePageMeta } from '../shared/pageMeta.js'

export function render(routePath: string): {
  body: string
  title: string
  description: string
} {
  const body = renderToString(<App routePath={routePath} />)
  const page =
    pages[routePath] ??
    pages['/404'] ?? {
      kind: 'markdown' as const,
      html: '',
      title: 'Not found',
      description: site.description,
      meta: {},
      headings: []
    }
  const { title, description } = resolvePageMeta(
    page.kind === 'markdown'
      ? {
          title: page.title,
          description: page.description,
          kind: 'markdown',
          html: page.html
        }
      : {
          title: page.title,
          description: page.description,
          kind: 'mdx'
        },
    site
  )
  return { body, title, description }
}
