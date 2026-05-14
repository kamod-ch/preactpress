import { renderToString } from 'preact-render-to-string'
import { App } from './app.js'
import { pages } from 'virtual:preactpress-pages'
import { site } from 'virtual:preactpress-site'

export function render(routePath: string): {
  body: string
  title: string
  description: string
} {
  const body = renderToString(<App routePath={routePath} />)
  const page =
    pages[routePath] ??
    pages['/404'] ?? {
      html: '',
      title: 'Not found',
      description: site.description,
      meta: {}
    }
  const title =
    page.title && page.title.length > 0
      ? `${page.title} | ${site.title}`
      : site.title
  const description =
    (page.description && String(page.description)) || site.description
  return { body, title, description }
}
