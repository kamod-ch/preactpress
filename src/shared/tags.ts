import { normalizeRoute } from './route.js'
import { slugifySegment } from './slug.js'

/** URL path segment for a tag (lowercase, hyphenated ASCII). */
export function slugifyTagSegment(tag: string): string {
  return slugifySegment(tag, '')
}

export function parseTagsField(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === 'string') return value.trim() ? [value.trim()] : []
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const v of value) {
    if (typeof v === 'string' && v.trim()) out.push(v.trim())
    else if (typeof v === 'number' || typeof v === 'boolean') out.push(String(v))
  }
  return out
}

export function resolvePageTags(meta: Record<string, unknown>): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const tag of [...parseTagsField(meta.tags), ...parseTagsField(meta.tag)]) {
    const slug = slugifyTagSegment(tag)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    out.push(tag.trim())
  }
  return out
}

export function tagIndexPageRoute(slug: string): string {
  return normalizeRoute(`/tags/${slug}`)
}
