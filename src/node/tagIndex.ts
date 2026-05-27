import { scanContentFiles, type ContentFile } from './content.js'
import { readMarkdownMetadata } from './markdown.js'
import type { SiteConfig } from './siteConfig.js'
import { resolvePageTags, slugifyTagSegment, tagIndexPageRoute } from '../shared/tags.js'
import { isDraftPage } from '../shared/pageMeta.js'
import { escapeHtml } from '../shared/escapeHtml.js'

export { slugifyTagSegment, tagIndexPageRoute }

export type TagIndexBucket = {
  label: string
  items: { route: string; title?: string }[]
}

/**
 * Reads frontmatter from each content file and groups pages by tag slug.
 * Supports `tags: [a, b]` and singular `tag: a`.
 */
export function collectTagSlugMap(files: ContentFile[]): Map<string, TagIndexBucket> {
  const bySlug = new Map<
    string,
    { label: string; byRoute: Map<string, { route: string; title?: string }> }
  >()

  for (const file of files) {
    const { meta, title } = readMarkdownMetadata(file.file)
    if (isDraftPage(meta)) continue
    for (const raw of resolvePageTags(meta)) {
      const slug = slugifyTagSegment(raw)
      if (!slug) continue
      let slot = bySlug.get(slug)
      if (!slot) {
        slot = { label: raw.trim(), byRoute: new Map() }
        bySlug.set(slug, slot)
      }
      slot.byRoute.set(file.route, { route: file.route, title })
    }
  }

  const out = new Map<string, TagIndexBucket>()
  for (const [slug, { label, byRoute }] of bySlug) {
    const items = [...byRoute.values()].sort((a, b) => a.route.localeCompare(b.route))
    out.set(slug, { label, items })
  }
  return out
}

export function renderTagIndexHtml(
  slug: string,
  label: string,
  items: { route: string; title?: string }[]
): string {
  const lis = items
    .map(
      (it) =>
        `  <li><a href="${escapeHtml(it.route)}">${escapeHtml(it.title ?? it.route)}</a></li>`
    )
    .join('\n')
  return (
    `<article class="pp-tag-index">` +
    `<h1 class="pp-heading" id="tag-${escapeHtml(slug)}">Pages tagged: ${escapeHtml(label)}</h1>` +
    `<p class="pp-tag-index-count">${items.length} page(s).</p>` +
    `<ul class="pp-tag-index-list">\n${lis}\n</ul>` +
    `</article>`
  )
}

export async function listTagIndexRoutes(
  site: Pick<SiteConfig, 'srcDir'>,
  fileRouteSet: ReadonlySet<string>
): Promise<string[]> {
  const files = (await scanContentFiles(site)).filter(
    (file) => !isDraftPage(readMarkdownMetadata(file.file).meta)
  )
  const map = collectTagSlugMap(files)
  const routes: string[] = []
  for (const slug of map.keys()) {
    const route = tagIndexPageRoute(slug)
    if (fileRouteSet.has(route)) continue
    routes.push(route)
  }
  return routes.sort()
}
