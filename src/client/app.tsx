import { useMemo } from 'preact/hooks'
import Layout from 'virtual:preactpress-layout'
import { pages } from 'virtual:preactpress-pages'
import { site, themeConfig } from 'virtual:preactpress-site'
import type { PageView } from './types.js'

export function App({ routePath }: { routePath: string }) {
  const page: PageView | undefined = useMemo(() => {
    return (
      pages[routePath] ??
      pages['/404'] ?? {
        html: '<p>Page not found.</p>',
        title: '404',
        description: undefined,
        meta: {}
      }
    )
  }, [routePath])

  return (
    <Layout
      site={site}
      themeConfig={themeConfig}
      routePath={routePath}
      page={page}
    />
  )
}
