import type { HeadTag, SiteConfig } from './siteConfig.js'
import { PREACTPRESS_THEME_BOOT_SCRIPT } from '../shared/theme.js'
import { canonicalUrl, publicUrl } from '../shared/url.js'

export { publicUrl } from '../shared/url.js'

export function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function escapeAttr(s: string): string {
  return escapeHtml(s)
}

export function absoluteUrl(site: SiteConfig, route: string): string {
  return canonicalUrl({ url: site.site.url, base: site.site.base, route })
}

export function renderHeadTag(tag: HeadTag): string {
  const [name, attrs, content] = tag
  const renderedAttrs = Object.entries(attrs)
    .filter(([, value]) => value != null && value !== false)
    .map(([key, value]) => (value === true ? key : `${key}="${escapeAttr(String(value))}"`))
    .join(' ')
  if (name === 'script') {
    return `<script${renderedAttrs ? ` ${renderedAttrs}` : ''}>${content ?? ''}</script>`
  }
  return `<${name}${renderedAttrs ? ` ${renderedAttrs}` : ''}>`
}

export function buildDefaultHeadTags(opts: {
  site: SiteConfig
  route: string
  title: string
  description: string
}): HeadTag[] {
  const { site, route, title, description } = opts
  const canonical = absoluteUrl(site, route)
  return [
    ['meta', { name: 'description', content: description }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['link', { rel: 'canonical', href: canonical }]
  ]
}

export function renderStylesheetLinks(hrefs: string[]): string {
  return hrefs
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join('\n    ')
}

export async function collectHeadTags(opts: {
  site: SiteConfig
  route: string
  title: string
  description: string
}): Promise<string> {
  const { site, route, title, description } = opts
  const defaultHead = buildDefaultHeadTags({ site, route, title, description })
  const transformed = site.transformHead
    ? await site.transformHead({ route, title, description, site: site.site })
    : []
  return [...defaultHead, ...site.head, ...transformed]
    .filter(
      (tag) =>
        tag[1] && !Object.values(tag[1]).every((value) => value == null || value === false)
    )
    .map(renderHeadTag)
    .join('\n    ')
}

export async function pageHtml(opts: {
  site: SiteConfig
  body: string
  title: string
  description: string
  route: string
  mainJs: string
  mainCss: string[]
}): Promise<string> {
  const { site, body, title, description, route, mainJs, mainCss } = opts
  const base = site.site.base
  const cssTags = renderProductionStylesheetLinks(mainCss, base)
  const scriptSrc = escapeHtml(publicUrl(base, mainJs))
  const routeJson = JSON.stringify(route)
  const headTags = await collectHeadTags({ site, route, title, description })

  return `<!DOCTYPE html>
<html lang="${escapeAttr(site.site.lang)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <script>${PREACTPRESS_THEME_BOOT_SCRIPT}</script>
    ${headTags}
    ${cssTags}
  </head>
  <body>
    <script>window.__PREACTPRESS_ROUTE__=${routeJson}</script>
    <div id="app">${body}</div>
    <script type="module" crossorigin src="${scriptSrc}"></script>
  </body>
</html>
`
}

function renderProductionStylesheetLinks(mainCss: string[], base: string): string {
  return mainCss
    .map((c) => {
      const href = publicUrl(base, `${c}`)
      return `<link rel="stylesheet" crossorigin href="${escapeHtml(href)}">`
    })
    .join('\n    ')
}

/** Patch a Vite-transformed dev index.html with per-route SEO and SSR body. */
export async function injectDevPageDocument(
  html: string,
  opts: {
    site: SiteConfig
    body: string
    title: string
    description: string
    route: string
    /** Dev-only stylesheet URLs from the Vite client module graph (avoids FOUC). */
    devStylesheets?: string[]
  }
): Promise<string> {
  const { site, body, title, description, route, devStylesheets } = opts
  const headTags = await collectHeadTags({ site, route: opts.route, title, description })
  const devCssTags =
    devStylesheets?.length && !devStylesheets.every((href) => html.includes(href))
      ? renderStylesheetLinks(
          devStylesheets.filter((href) => !html.includes(href))
        )
      : ''
  const routeJson = JSON.stringify(route)
  const lang = escapeAttr(site.site.lang)

  let out = html
  if (/<html\b/i.test(out)) {
    out = out.replace(/<html\b([^>]*)>/i, (_match, attrs: string) => {
      const withoutLang = attrs.replace(/\s+lang=(['"])[^'"]*\1/i, '')
      return `<html lang="${lang}"${withoutLang}>`
    })
  }

  if (/<title>[\s\S]*?<\/title>/i.test(out)) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  } else {
    out = out.replace(/<\/head>/i, `    <title>${escapeHtml(title)}</title>\n  </head>`)
  }

  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    ''
  )
  const headInject = [headTags, devCssTags].filter(Boolean).join('\n    ')
  out = out.replace(/<\/head>/i, `    ${headInject}\n  </head>`)

  const routeScript = `<script>window.__PREACTPRESS_ROUTE__=${routeJson}</script>`
  if (out.includes('__PREACTPRESS_ROUTE__')) {
    out = out.replace(
      /<script>window\.__PREACTPRESS_ROUTE__=[^<]*<\/script>/,
      routeScript
    )
  } else {
    out = out.replace(/<body\b[^>]*>/i, (match) => `${match}\n    ${routeScript}`)
  }

  out = out.replace(
    /<div\s+id=["']app["'][^>]*>[\s\S]*?<\/div>/i,
    `<div id="app">${body}</div>`
  )

  return out
}
