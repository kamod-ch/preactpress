import { useEffect, useMemo, useState } from 'preact/hooks'
import { publicUrl } from '../shared/url.js'

export interface SearchEntry {
  route: string
  title?: string
  description?: string
  excerpt?: string
  tags?: string[]
}

export function useSiteSearch(base: string, query: string): SearchEntry[] {
  const [entries, setEntries] = useState<SearchEntry[]>([])

  useEffect(() => {
    let cancelled = false
    fetch(publicUrl(base, 'preactpress-search.json'), { credentials: 'same-origin' })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setEntries(data as SearchEntry[])
      })
      .catch(() => {
        if (!cancelled) setEntries([])
      })
    return () => {
      cancelled = true
    }
  }, [base])

  return useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return entries
      .map((entry) => ({ entry, score: scoreEntry(entry, needle) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ entry }) => entry)
  }, [entries, query])
}

function scoreEntry(entry: SearchEntry, query: string): number {
  const title = entry.title?.toLowerCase() ?? ''
  const tags = entry.tags?.join(' ').toLowerCase() ?? ''
  const description = entry.description?.toLowerCase() ?? ''
  const excerpt = entry.excerpt?.toLowerCase() ?? ''
  let score = 0
  if (title === query) score += 20
  if (title.includes(query)) score += 10
  if (tags.includes(query)) score += 6
  if (description.includes(query)) score += 4
  if (excerpt.includes(query)) score += 2
  if (entry.route.toLowerCase().includes(query)) score += 1
  return score
}
