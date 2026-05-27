import { useEffect, useState } from 'preact/hooks'
import Layout from 'virtual:preactpress-layout'
import { pagesMeta } from 'virtual:preactpress-pages'
import { site, themeConfig } from 'virtual:preactpress-site'
import type { PageView } from './types.js'
import { usePageHead } from './usePageHead.js'
import { normalizeRoute, routeFromPathname } from '../shared/route.js'
import { loadPage, prefetchPage, seedPage } from './loadPage.js'

function routeFromLocation(): string {
  return routeFromPathname(window.location.pathname, site.base)
}

function routeFromHref(href: string): string | undefined {
  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) return undefined
  const base = site.base === '/' ? '' : site.base.replace(/\/$/, '')
  if (base && url.pathname !== base && !url.pathname.startsWith(`${base}/`)) {
    return undefined
  }
  const path = base ? url.pathname.slice(base.length) || '/' : url.pathname
  return normalizeRoute(path)
}

function loadingPage(route: string): PageView {
  const meta = pagesMeta[route]
  return {
    kind: 'markdown',
    html: '<p>Loading...</p>',
    title: meta?.title,
    description: meta?.description,
    tags: meta?.tags,
    image: meta?.image,
    pageType: meta?.pageType,
    meta: meta?.meta ?? {},
    headings: meta?.headings ?? []
  }
}

export function App({ routePath, initialPage }: { routePath: string; initialPage?: PageView }) {
  const [currentRoute, setCurrentRoute] = useState(() => normalizeRoute(routePath))
  const [page, setPage] = useState<PageView>(() => initialPage ?? loadingPage(routePath))

  useEffect(() => {
    if (initialPage) seedPage(normalizeRoute(routePath), initialPage)
  }, [initialPage, routePath])

  useEffect(() => {
    let cancelled = false
    setPage(loadingPage(currentRoute))
    void loadPage(currentRoute, site.base)
      .then((loaded) => {
        if (!cancelled) setPage(loaded)
      })
      .catch(() => {
        if (!cancelled) {
          setPage({
            kind: 'markdown',
            html: '<p>Page not found.</p>',
            title: '404',
            description: site.description,
            meta: {},
            headings: []
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [currentRoute])

  useEffect(() => {
    const onPopState = () => setCurrentRoute(routeFromLocation())
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return
      }
      const target = event.target as Element | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link || link.target || link.hasAttribute('download')) return
      const route = routeFromHref(link.href)
      if (!route) return
      const url = new URL(link.href)
      if (url.hash && route === currentRoute) {
        document.getElementById(url.hash.slice(1))?.scrollIntoView()
        return
      }
      event.preventDefault()
      window.history.pushState({}, '', url)
      setCurrentRoute(route)
      window.scrollTo({ top: 0 })
    }
    const onMouseEnter = (event: MouseEvent) => {
      const target = event.target as Element | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link) return
      const route = routeFromHref(link.href)
      if (route) prefetchPage(route, site.base)
    }
    window.addEventListener('popstate', onPopState)
    document.addEventListener('click', onClick)
    document.addEventListener('mouseenter', onMouseEnter, true)
    return () => {
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('click', onClick)
      document.removeEventListener('mouseenter', onMouseEnter, true)
    }
  }, [currentRoute])

  useEffect(() => {
    if (currentRoute !== normalizeRoute(routePath)) {
      document.getElementById('content')?.focus()
    }
  }, [currentRoute, routePath])

  usePageHead({
    site,
    route: currentRoute,
    page:
      page?.kind === 'markdown'
        ? {
            title: page.title,
            description: page.description,
            tags: page.tags,
            kind: 'markdown',
            html: page.html
          }
        : page
          ? {
              title: page.title,
              description: page.description,
              tags: page.tags,
              kind: 'mdx'
            }
          : undefined
  })

  return (
    <Layout
      site={site}
      themeConfig={themeConfig}
      routePath={currentRoute}
      page={page}
    />
  )
}
