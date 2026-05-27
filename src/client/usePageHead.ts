import { useEffect } from 'preact/hooks'
import type { SiteData } from '../node/siteConfig.js'
import { resolvePageHeadMeta, type PageMetaInput } from '../shared/pageMeta.js'
import { canonicalUrl, publicUrl } from '../shared/url.js'

function upsertMeta(
  selector: 'name' | 'property',
  key: string,
  content: string
): void {
  if (!content) return
  let el = document.head.querySelector(
    `meta[${selector}="${key}"]`
  ) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(selector, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function removeMeta(selector: 'name' | 'property', key: string): void {
  document.head
    .querySelectorAll(`meta[${selector}="${key}"]`)
    .forEach((el) => el.remove())
}

function appendMeta(selector: 'name' | 'property', key: string, content: string): void {
  if (!content) return
  const el = document.createElement('meta')
  el.setAttribute(selector, key)
  el.content = content
  document.head.appendChild(el)
}

function upsertCanonical(href: string): void {
  if (!href) return
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

function removeCanonical(): void {
  document.head
    .querySelectorAll('link[rel="canonical"]')
    .forEach((el) => el.remove())
}

function resolveMetaImage(site: SiteData, image: string | undefined): string | undefined {
  if (!image) return undefined
  if (/^(?:[a-z]+:)?\/\//i.test(image)) return image
  return site.url
    ? `${site.url}${publicUrl(site.base, image)}`
    : publicUrl(site.base, image)
}

export function usePageHead(opts: {
  site: SiteData
  route: string
  page: PageMetaInput | undefined
}): void {
  const { site, route, page } = opts
  const pageTitle = page?.title
  const pageDescription = page?.description
  const pageTags = page?.tags
  const pageImage = page?.image
  const pageType = page?.pageType
  const pageKind = page?.kind
  const pageHtml = page?.kind === 'markdown' ? page.html : undefined

  useEffect(() => {
    const head = resolvePageHeadMeta(
      pageKind === 'markdown'
        ? {
            title: pageTitle,
            description: pageDescription,
            tags: pageTags,
            image: pageImage,
            pageType,
            kind: 'markdown',
            html: pageHtml
          }
        : pageKind
          ? {
              title: pageTitle,
              description: pageDescription,
              tags: pageTags,
              image: pageImage,
              pageType,
              kind: pageKind
            }
          : undefined,
      site
    )

    document.title = head.title

    upsertMeta('name', 'description', head.description)
    upsertMeta('property', 'og:title', head.title)
    upsertMeta('property', 'og:description', head.description)
    upsertMeta('property', 'og:type', head.pageType)
    upsertMeta('name', 'twitter:card', head.image ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', head.title)
    upsertMeta('name', 'twitter:description', head.description)
    removeMeta('name', 'keywords')
    removeMeta('property', 'article:tag')
    for (const tag of head.tags) appendMeta('property', 'article:tag', tag)

    const image = resolveMetaImage(site, head.image)
    if (image) {
      upsertMeta('property', 'og:image', image)
      upsertMeta('name', 'twitter:image', image)
    } else {
      removeMeta('property', 'og:image')
      removeMeta('name', 'twitter:image')
    }

    const canonical = canonicalUrl({ url: site.url, base: site.base, route })
    if (canonical) {
      upsertMeta('property', 'og:url', canonical)
      upsertCanonical(canonical)
    } else {
      removeMeta('property', 'og:url')
      removeCanonical()
    }

    if (document.documentElement.lang !== site.lang) {
      document.documentElement.lang = site.lang
    }
  }, [site, route, pageTitle, pageDescription, pageTags, pageImage, pageType, pageKind, pageHtml])
}
