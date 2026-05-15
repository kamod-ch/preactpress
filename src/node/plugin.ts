import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import type { SiteConfig } from './siteConfig.js'
import { readMarkdownFile, readMarkdownMetadata } from './markdown.js'
import { siteConfigToClientJson } from './config.js'
import { PREACTPRESS_THEME_BOOT_SCRIPT } from '../shared/theme.js'
import { createFaviconMiddleware, faviconHtmlTags } from './favicon.js'
import { createDevSsrMiddleware } from './devSsr.js'
import {
  CONTENT_EXTENSIONS,
  listMarkdownRoutes as listFileMarkdownRoutes,
  mdFileToRoute,
  scanContentFiles,
  type ContentFile,
  type ContentKind
} from './content.js'
import {
  collectTagSlugMap,
  renderTagIndexHtml,
  tagIndexPageRoute,
  listTagIndexRoutes
} from './tagIndex.js'

const VIRTUAL_LAYOUT = '\0virtual:preactpress-layout'
const VIRTUAL_PAGES = '\0virtual:preactpress-pages'
const VIRTUAL_SITE = '\0virtual:preactpress-site'
export { mdFileToRoute }

export async function listMarkdownRoutes(site: SiteConfig): Promise<string[]> {
  const files = await listFileMarkdownRoutes(site)
  const tagRoutes = await listTagIndexRoutes(site, new Set(files))
  return [...files, ...tagRoutes].sort()
}

export function preactPressPlugin(site: SiteConfig): Plugin {
  const routeToFile = new Map<string, ContentFile>()
  let pagesModule = ''

  async function scan(): Promise<void> {
    routeToFile.clear()
    for (const file of await scanContentFiles(site)) {
      routeToFile.set(file.route, file)
    }
  }

  async function buildPagesModule(): Promise<string> {
    const filesList = [...routeToFile.values()]
    const tagMap = collectTagSlugMap(filesList)
    const fileRouteSet = new Set(routeToFile.keys())
    const syntheticTagRoutes: string[] = []
    for (const slug of tagMap.keys()) {
      const tr = tagIndexPageRoute(slug)
      if (!fileRouteSet.has(tr)) syntheticTagRoutes.push(tr)
    }
    const routes = [...fileRouteSet, ...syntheticTagRoutes].sort()
    const entries: Record<
      string,
      {
        meta: Record<string, unknown>
        kind: ContentKind
        html: string
        title?: string
        description?: string
        headings: { id: string; text: string; level: number }[]
        relativePath?: string
        lastUpdated?: string
      }
    > = {}
    const mdxImports: string[] = []
    const mdxEntries: string[] = []
    let mdxIndex = 0
    for (const [route, file] of routeToFile) {
      const stats = await fs.stat(file.file)
      const relativePath = path.relative(site.srcDir, file.file).split(path.sep).join('/')
      const lastUpdated = stats.mtime.toISOString()
      if (file.kind === 'mdx') {
        const r = readMarkdownMetadata(file.file)
        const componentName = `MdxPage${mdxIndex}`
        mdxIndex += 1
        mdxImports.push(`import ${componentName} from ${JSON.stringify(file.file)};`)
        mdxEntries.push(`${JSON.stringify(route)}: { kind: "mdx", Component: ${componentName}, meta: ${JSON.stringify(r.meta)}, title: ${JSON.stringify(r.title)}, description: ${JSON.stringify(r.description)}, headings: ${JSON.stringify(r.headings)}, relativePath: ${JSON.stringify(relativePath)}, lastUpdated: ${JSON.stringify(lastUpdated)} }`)
        continue
      }

      const r = await readMarkdownFile(file.file, {
        ...site.markdown,
        route,
        routes
      })
      entries[route] = {
        kind: 'markdown',
        meta: r.meta,
        html: r.html,
        title: r.title,
        description: r.description,
        headings: r.headings,
        relativePath,
        lastUpdated
      }
    }
    for (const [slug, data] of tagMap) {
      const tr = tagIndexPageRoute(slug)
      if (fileRouteSet.has(tr)) continue
      entries[tr] = {
        kind: 'markdown',
        meta: { tagIndex: true, tag: data.label, tagSlug: slug },
        html: renderTagIndexHtml(slug, data.label, data.items),
        title: `Tag: ${data.label}`,
        description: `Pages tagged “${data.label}”`,
        headings: [],
        relativePath: undefined,
        lastUpdated: undefined
      }
    }
    const markdownEntries = Object.entries(entries).map(
      ([route, page]) => `${JSON.stringify(route)}: ${JSON.stringify(page)}`
    )
    return `${mdxImports.join('\n')}\nexport const routes = ${JSON.stringify(routes)};\nexport const pages = {\n${[
      ...markdownEntries,
      ...mdxEntries
    ].map((entry) => `  ${entry}`).join(',\n')}\n};\n`
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
    transformIndexHtml(html) {
      if (!html.includes('</head>')) return html
      const tags = [
        faviconHtmlTags(site.site.base),
        `<script>${PREACTPRESS_THEME_BOOT_SCRIPT}</script>`
      ]
      const inject =
        html.includes('rel="icon"') || html.includes("rel='icon'")
          ? tags.slice(1)
          : tags
      return html.replace('</head>', `    ${inject.join('\n    ')}\n  </head>`)
    },
    async buildStart() {
      await scan()
    },
    configureServer(server) {
      server.middlewares.use(createDevSsrMiddleware(site, server))
      server.middlewares.use(createFaviconMiddleware(site.site.base))
      server.watcher.add(site.srcDir)
      server.watcher.on('all', async (_evt, file) => {
        if (typeof file === 'string' && CONTENT_EXTENSIONS.some((ext) => file.endsWith(ext))) {
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
