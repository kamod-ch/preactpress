import { useEffect, useMemo, useState } from 'preact/hooks'
import Layout from 'virtual:preactpress-layout'
import { pages } from 'virtual:preactpress-pages'
import { site, themeConfig } from 'virtual:preactpress-site'
import type { PageView } from './types.js'

function routeFromLocation(): string {
  const base = site.base === '/' ? '' : site.base.replace(/\/$/, '')
  let p = window.location.pathname
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/'
  return normalizeRoute(p)
}

function normalizeRoute(route: string): string {
  const clean = route.split(/[?#]/, 1)[0] || '/'
  const prefixed = clean.startsWith('/') ? clean : `/${clean}`
  return prefixed.replace(/\/$/, '') || '/'
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

export function App({ routePath }: { routePath: string }) {
  const [currentRoute, setCurrentRoute] = useState(() => normalizeRoute(routePath))

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
      if (url.hash && route === currentRoute) return
      event.preventDefault()
      window.history.pushState({}, '', url)
      setCurrentRoute(route)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', onPopState)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('click', onClick)
    }
  }, [currentRoute])

  const page: PageView | undefined = useMemo(() => {
    return (
      pages[currentRoute] ??
      pages['/404'] ?? {
        html: '<p>Page not found.</p>',
        title: '404',
        description: undefined,
        meta: {},
        headings: []
      }
    )
  }, [currentRoute])

  return (
    <Layout
      site={site}
      themeConfig={themeConfig}
      routePath={currentRoute}
      page={page}
    />
  )
}
