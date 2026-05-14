import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import { glob } from 'tinyglobby'
import type { SiteConfig } from './siteConfig.js'
import { readMarkdownFile, readMarkdownMetadata } from './markdown.js'
import { siteConfigToClientJson } from './config.js'

const VIRTUAL_LAYOUT = '\0virtual:preactpress-layout'
const VIRTUAL_PAGES = '\0virtual:preactpress-pages'
const VIRTUAL_SITE = '\0virtual:preactpress-site'
const CONTENT_GLOBS = ['**/*.md', '**/*.mdx'] as const
const CONTENT_EXTENSIONS = ['.mdx', '.md'] as const

type ContentKind = 'markdown' | 'mdx'

interface ContentFile {
  route: string
  file: string
  kind: ContentKind
}

export function mdFileToRoute(srcDir: string, file: string): string {
  let rel = path.relative(srcDir, file).split(path.sep).join('/')
  const ext = CONTENT_EXTENSIONS.find((candidate) => rel.endsWith(candidate))
  if (!ext) return '/'
  rel = rel.slice(0, -ext.length)
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length)
  if (rel === 'index' || rel === '') return '/'
  return '/' + rel
}

export async function listMarkdownRoutes(site: SiteConfig): Promise<string[]> {
  const files = await scanContentFiles(site)
  return files.map((f) => f.route).sort()
}

async function scanContentFiles(site: SiteConfig): Promise<ContentFile[]> {
  const files = await glob([...CONTENT_GLOBS], {
    cwd: site.srcDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.preactpress/**']
  })
  const routeToFile = new Map<string, ContentFile>()
  for (const file of files.sort()) {
    const route = mdFileToRoute(site.srcDir, file)
    const kind: ContentKind = file.endsWith('.mdx') ? 'mdx' : 'markdown'
    const existing = routeToFile.get(route)
    if (existing) {
      throw new Error(
        `preactpress: route collision for ${route}: ${path.relative(site.srcDir, existing.file)} and ${path.relative(site.srcDir, file)}`
      )
    }
    routeToFile.set(route, { route, file, kind })
  }
  return [...routeToFile.values()]
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
    const entries: Record<
      string,
      {
        meta: Record<string, unknown>
        kind: ContentKind
        html: string
        title?: string
        description?: string
        headings: { id: string; text: string; level: number }[]
      }
    > = {}
    const mdxImports: string[] = []
    const mdxEntries: string[] = []
    let mdxIndex = 0
    for (const [route, file] of routeToFile) {
      if (file.kind === 'mdx') {
        const r = readMarkdownMetadata(file.file)
        const componentName = `MdxPage${mdxIndex}`
        mdxIndex += 1
        mdxImports.push(`import ${componentName} from ${JSON.stringify(file.file)};`)
        mdxEntries.push(`${JSON.stringify(route)}: { kind: "mdx", Component: ${componentName}, meta: ${JSON.stringify(r.meta)}, title: ${JSON.stringify(r.title)}, description: ${JSON.stringify(r.description)}, headings: ${JSON.stringify(r.headings)} }`)
        continue
      }

      const r = await readMarkdownFile(file.file, site.markdown)
      entries[route] = {
        kind: 'markdown',
        meta: r.meta,
        html: r.html,
        title: r.title,
        description: r.description,
        headings: r.headings
      }
    }
    const markdownEntries = Object.entries(entries).map(
      ([route, page]) => `${JSON.stringify(route)}: ${JSON.stringify(page)}`
    )
    return `${mdxImports.join('\n')}\nexport const pages = {\n${[
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
    async buildStart() {
      await scan()
    },
    configureServer(server) {
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
