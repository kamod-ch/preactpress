import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import { glob } from 'tinyglobby'
import type { SiteConfig } from './siteConfig.js'
import { readMarkdownFile } from './markdown.js'
import { siteConfigToClientJson } from './config.js'

const VIRTUAL_LAYOUT = '\0virtual:preactpress-layout'
const VIRTUAL_PAGES = '\0virtual:preactpress-pages'
const VIRTUAL_SITE = '\0virtual:preactpress-site'

export function mdFileToRoute(srcDir: string, file: string): string {
  let rel = path.relative(srcDir, file).split(path.sep).join('/')
  if (!rel.endsWith('.md')) return '/'
  rel = rel.slice(0, -3)
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length)
  if (rel === 'index' || rel === '') return '/'
  return '/' + rel
}

export async function listMarkdownRoutes(site: SiteConfig): Promise<string[]> {
  const files = await glob(['**/*.md'], {
    cwd: site.srcDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.preactpress/**']
  })
  const routes = files.map((f) => mdFileToRoute(site.srcDir, f))
  return [...new Set(routes)].sort()
}

export function preactPressPlugin(site: SiteConfig): Plugin {
  const routeToFile = new Map<string, string>()
  let pagesModule = ''

  async function scan(): Promise<void> {
    routeToFile.clear()
    const files = await glob(['**/*.md'], {
      cwd: site.srcDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.preactpress/**']
    })
    for (const file of files) {
      const route = mdFileToRoute(site.srcDir, file)
      routeToFile.set(route, file)
    }
  }

  async function buildPagesModule(): Promise<string> {
    const entries: Record<
      string,
      {
        meta: Record<string, unknown>
        html: string
        title?: string
        description?: string
        headings: { id: string; text: string; level: number }[]
      }
    > = {}
    for (const [route, file] of routeToFile) {
      const r = await readMarkdownFile(file, site.markdown)
      entries[route] = {
        meta: r.meta,
        html: r.html,
        title: r.title,
        description: r.description,
        headings: r.headings
      }
    }
    return `export const pages = ${JSON.stringify(entries)};\n`
  }

  function invalidateVirtuals(server: ViteDevServer) {
    pagesModule = ''
    for (const id of [VIRTUAL_PAGES, VIRTUAL_SITE]) {
      const m = server.moduleGraph.getModuleById(id)
      if (m) server.moduleGraph.invalidateModule(m)
    }
  }

  return {
    name: 'preactpress',
    enforce: 'pre',
    async buildStart() {
      await scan()
    },
    configureServer(server) {
      server.watcher.add(site.srcDir)
      server.watcher.on('all', async (_evt, file) => {
        if (typeof file === 'string' && file.endsWith('.md')) {
          await scan()
          invalidateVirtuals(server)
        }
      })
    },
    resolveId(id) {
      if (id === 'virtual:preactpress-layout') return VIRTUAL_LAYOUT
      if (id === 'virtual:preactpress-pages') return VIRTUAL_PAGES
      if (id === 'virtual:preactpress-site') return VIRTUAL_SITE
      return undefined
    },
    async load(id) {
      if (id === VIRTUAL_LAYOUT) {
        return `export { default } from ${JSON.stringify(site.theme)};\n`
      }
      if (id === VIRTUAL_SITE) {
        const data = JSON.parse(siteConfigToClientJson(site)) as {
          site: SiteConfig['site']
          themeConfig: SiteConfig['themeConfig']
        }
        return `export const site = ${JSON.stringify(data.site)};\nexport const themeConfig = ${JSON.stringify(data.themeConfig)};\n`
      }
      if (id === VIRTUAL_PAGES) {
        if (!pagesModule) pagesModule = await buildPagesModule()
        return pagesModule
      }
      return undefined
    }
  }
}
