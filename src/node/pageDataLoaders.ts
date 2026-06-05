import path from 'node:path'
import { glob } from 'tinyglobby'
import { createContentLoader, isContentLoader, type ContentItem, type ContentLoader } from './createContentLoader.js'
import { mdFileToRoute } from './content.js'
import { readMarkdownMetadata } from './markdown.js'
import { loadSiteModule } from './loadSiteModule.js'
import { normalizeRoute } from '../shared/route.js'
import type { SiteConfig } from './siteConfig.js'
import { publicUrl } from '../shared/url.js'

export { createContentLoader, isContentLoader }
export type { ContentItem, ContentLoader }

function dataFileToRoute(srcDir: string, dataFile: string): string {
  let rel = path.relative(srcDir, dataFile).replace(/\.data\.ts$/, '').split(path.sep).join('/')
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length)
  if (rel === 'index' || rel === '') return '/'
  return normalizeRoute('/' + rel)
}

async function runContentLoader(
  loader: ContentLoader,
  site: SiteConfig
): Promise<unknown> {
  const matchedFiles = new Set<string>()
  for (const pattern of loader.patterns) {
    if (pattern.startsWith('!')) continue
    const hits = await glob([pattern], {
      cwd: site.srcDir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.preactpress/**', ...(site.srcExclude ?? [])]
    })
    for (const hit of hits) matchedFiles.add(hit)
  }

  const items: ContentItem[] = []
  for (const file of matchedFiles) {
    const route = mdFileToRoute(site.srcDir, file)
    const relativePath = path.relative(site.srcDir, file).split(path.sep).join('/')
    const meta = readMarkdownMetadata(file)
    items.push({
      route,
      relativePath,
      file,
      frontmatter: meta.meta,
      title: meta.title,
      description: meta.description,
      url: publicUrl(site.site.base, route === '/' ? '/' : route)
    })
  }

  const sorted = items.sort((a, b) => a.route.localeCompare(b.route))
  if (loader.transform) return loader.transform(sorted)
  return sorted
}

export async function resolvePageDataMap(site: SiteConfig): Promise<Map<string, unknown>> {
  const dataFiles = await glob(['**/*.data.ts'], {
    cwd: site.srcDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.preactpress/**', ...(site.srcExclude ?? [])]
  })
  const map = new Map<string, unknown>()

  for (const dataFile of dataFiles.sort()) {
    const route = dataFileToRoute(site.srcDir, dataFile)
    const loader = await loadSiteModule<unknown>(dataFile, site.root)
    if (!isContentLoader(loader)) {
      throw new Error(
        `preactpress: ${path.relative(site.srcDir, dataFile)} must default-export createContentLoader(...)`
      )
    }
    map.set(route, await runContentLoader(loader, site))
  }

  return map
}
