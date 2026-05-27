import type { HeadTag, SiteConfig } from './siteConfig.js'
import { parse as parseHtml } from 'node-html-parser'
import { PREACTPRESS_THEME_SCRIPT } from '../shared/theme.js'
import { canonicalUrl, publicUrl } from '../shared/url.js'
import { escapeAttr, escapeHtml } from '../shared/escapeHtml.js'
import type { PageView } from '../client/types.js'

export { publicUrl } from '../shared/url.js'
export { escapeAttr, escapeHtml } from '../shared/escapeHtml.js'

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
  tags?: string[]
  image?: string
  pageType?: 'website' | 'article'
  pageData?: PageView
}): HeadTag[] {
  const { site, route, title, description, tags = [], image, pageType = 'website', pageData } = opts
  const canonical = absoluteUrl(site, route)
  const imageUrl = resolveHeadImage(site, image)
  const jsonLd = buildJsonLd({ site, route, title, description, image: imageUrl, pageType, pageData })
  return [
    ['meta', { name: 'description', content: description }],
    ...tags.map((tag): HeadTag => ['meta', { property: 'article:tag', content: tag }]),
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:type', content: pageType }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:image', content: imageUrl }],
    ['meta', { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: imageUrl }],
    ['link', { rel: 'canonical', href: canonical }],
    ['script', { type: 'application/ld+json' }, jsonLd]
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
  tags?: string[]
  image?: string
  pageType?: 'website' | 'article'
  pageData?: PageView
}): Promise<string> {
  const { site, route, title, description, tags = [], image, pageType, pageData } = opts
  const defaultHead = buildDefaultHeadTags({
    site,
    route,
    title,
    description,
    tags,
    image,
    pageType,
    pageData
  })
  const transformed = site.transformHead
    ? await site.transformHead({ route, title, description, tags, site: site.site })
    : []
  return [...defaultHead, ...site.head, ...transformed]
    .filter(
      (tag) =>
        tag[1] &&
        !Object.values(tag[1]).every((value) => value == null || value === false) &&
        !(tag[0] === 'meta' && Object.prototype.hasOwnProperty.call(tag[1], 'content') && tag[1].content == null)
    )
    .map(renderHeadTag)
    .join('\n    ')
}

export async function pageHtml(opts: {
  site: SiteConfig
  body: string
  title: string
  description: string
  tags?: string[]
  image?: string
  pageType?: 'website' | 'article'
  pageData?: PageView
  route: string
  mainJs: string
  mainCss: string[]
}): Promise<string> {
  const { site, body, title, description, tags = [], image, pageType, pageData, route, mainJs, mainCss } = opts
  const base = site.site.base
  const cssTags = renderProductionStylesheetLinks(mainCss, base)
  const scriptSrc = escapeHtml(publicUrl(base, mainJs))
  const themeScriptSrc = escapeHtml(publicUrl(base, PREACTPRESS_THEME_SCRIPT))
  const headTags = await collectHeadTags({ site, route, title, description, tags, image, pageType, pageData })
  const pageDataTemplate = renderPageDataTemplate(pageData)

  return `<!DOCTYPE html>
<html lang="${escapeAttr(site.site.lang)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <script src="${themeScriptSrc}"></script>
    ${headTags}
    ${cssTags}
  </head>
  <body>
    ${pageDataTemplate}
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

function resolveHeadImage(site: SiteConfig, image: string | undefined): string | undefined {
  if (!image) return undefined
  if (/^(?:[a-z]+:)?\/\//i.test(image)) return image
  return site.site.url
    ? `${site.site.url}${publicUrl(site.site.base, image)}`
    : publicUrl(site.site.base, image)
}

function buildJsonLd(opts: {
  site: SiteConfig
  route: string
  title: string
  description: string
  image?: string
  pageType: 'website' | 'article'
  pageData?: PageView
}): string {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': opts.pageType === 'article' ? 'Article' : 'WebPage',
    headline: opts.title,
    name: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.site, opts.route)
  }
  if (opts.image) data.image = opts.image
  if (opts.pageData?.lastUpdated) data.dateModified = opts.pageData.lastUpdated
  return JSON.stringify(data).replaceAll('<', '\\u003c')
}

function renderPageDataTemplate(page: PageView | undefined): string {
  if (!page || page.kind !== 'markdown') return ''
  return `<template id="__PREACTPRESS_PAGE_DATA__">${escapeHtml(JSON.stringify(page).replaceAll('<', '\\u003c'))}</template>`
}

/** Patch a Vite-transformed dev index.html with per-route SEO and SSR body. */
export async function injectDevPageDocument(
  html: string,
  opts: {
    site: SiteConfig
    body: string
    title: string
    description: string
    tags?: string[]
    image?: string
    pageType?: 'website' | 'article'
    pageData?: PageView
    route: string
    /** Dev-only stylesheet URLs from the Vite client module graph (avoids FOUC). */
    devStylesheets?: string[]
  }
): Promise<string> {
  const { site, body, title, description, tags = [], image, pageType, pageData, route, devStylesheets } = opts
  const headTags = await collectHeadTags({
    site,
    route: opts.route,
    title,
    description,
    tags,
    image,
    pageType,
    pageData
  })
  const devCssTags =
    devStylesheets?.length && !devStylesheets.every((href) => html.includes(href))
      ? renderStylesheetLinks(
          devStylesheets.filter((href) => !html.includes(href))
        )
      : ''
  const lang = escapeAttr(site.site.lang)

  const headInject = [headTags, devCssTags].filter(Boolean).join('\n    ')
  const doc = parseHtml(html, { comment: true })
  const htmlEl = doc.querySelector('html')
  if (htmlEl) htmlEl.setAttribute('lang', lang)

  const head = doc.querySelector('head')
  if (head) {
    const titleEl = head.querySelector('title')
    if (titleEl) titleEl.set_content(escapeHtml(title))
    else head.insertAdjacentHTML('beforeend', `    <title>${escapeHtml(title)}</title>\n`)
    head.querySelectorAll('meta[name="description"]').forEach((el) => el.remove())
    if (headInject) head.insertAdjacentHTML('beforeend', `    ${headInject}\n`)
  }

  const bodyEl = doc.querySelector('body')
  if (bodyEl) {
    bodyEl.querySelector('#__PREACTPRESS_PAGE_DATA__')?.remove()
    const template = renderPageDataTemplate(pageData)
    if (template) bodyEl.insertAdjacentHTML('afterbegin', `    ${template}\n`)
  }

  const app = doc.querySelector('#app')
  if (app) {
    app.set_content(body)
  }

  return doc.toString()
}
