import fs from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ViteDevServer } from 'vite'
import { routeFromPathname } from '../shared/route.js'
import { collectDevStylesheetHrefs } from './devCss.js'
import { injectDevPageDocument } from './html.js'
import { PACKAGE_ROOT } from './packageRoot.js'
import type { SiteConfig } from './siteConfig.js'

function ssrEntry(): string {
  return path.join(PACKAGE_ROOT, 'src/client/entry-ssr.tsx')
}

export function isDocumentRequest(url: string): boolean {
  const pathname = url.split('?')[0]?.split('#')[0] ?? '/'
  if (!pathname || pathname.startsWith('/@') || pathname.startsWith('/__')) return false
  if (pathname.includes('/node_modules/')) return false
  if (pathname.startsWith('/assets/')) return false
  const last = pathname.split('/').pop() ?? ''
  if (last.includes('.') && !last.endsWith('.html')) return false
  return true
}

export function createDevSsrMiddleware(
  site: SiteConfig,
  server: ViteDevServer
) {
  const indexPath = path.join(site.srcDir, 'index.html')
  const ssrId = ssrEntry()
  const cache = {
    indexTemplate: undefined as string | undefined,
    devStylesheets: undefined as string[] | undefined
  }

  const invalidateDevStyles = (): void => {
    cache.devStylesheets = undefined
  }

  server.watcher.on('change', (file) => {
    if (path.resolve(String(file)) === indexPath) cache.indexTemplate = undefined
    invalidateDevStyles()
  })

  async function devStylesheets(): Promise<string[]> {
    if (!cache.devStylesheets) {
      cache.devStylesheets = await collectDevStylesheetHrefs(server)
    }
    return cache.devStylesheets
  }

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    const rawUrl = req.url ?? '/'
    if (!isDocumentRequest(rawUrl)) return next()

    try {
      if (!cache.indexTemplate) {
        cache.indexTemplate = await fs.readFile(indexPath, 'utf8')
      }
      const route = routeFromPathname(
        rawUrl.split('?')[0]?.split('#')[0] ?? '/',
        site.site.base
      )
      const mod = (await server.ssrLoadModule(ssrId)) as {
        render: (routePath: string) => { body: string; title: string; description: string }
      }
      const { body, title, description } = mod.render(route)
      const transformed = await server.transformIndexHtml(rawUrl, cache.indexTemplate)
      const html = await injectDevPageDocument(transformed, {
        site,
        body,
        title,
        description,
        route,
        devStylesheets: await devStylesheets()
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      res.end(html)
    } catch (err) {
      site.logger.warn(`preactpress dev SSR failed for ${rawUrl}: ${err instanceof Error ? err.message : err}`)
      next()
    }
  }
}
