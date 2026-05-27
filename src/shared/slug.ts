import type { OutlineItem } from '../node/siteConfig.js'

export function slugifySegment(text: string, fallback = 'section'): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z0-9#]+;/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || fallback
}

export function uniqueSlug(base: string, existing: OutlineItem[]): string {
  let id = base
  let i = 1
  const used = new Set(existing.map((h) => h.id))
  while (used.has(id)) {
    i += 1
    id = `${base}-${i}`
  }
  return id
}
