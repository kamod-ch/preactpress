export interface SearchEntry {
  route: string;
  locale?: string;
  version?: string;
  workspace?: string;
  title?: string;
  description?: string;
  excerpt?: string;
  tags?: string[];
}

/** Rank local search entries for a normalized query string. */
export function scoreSearchEntry(entry: SearchEntry, query: string): number {
  const title = entry.title?.toLowerCase() ?? "";
  const tags = entry.tags?.join(" ").toLowerCase() ?? "";
  const description = entry.description?.toLowerCase() ?? "";
  const excerpt = entry.excerpt?.toLowerCase() ?? "";
  let score = 0;
  if (title === query) score += 20;
  if (title.includes(query)) score += 10;
  if (tags.includes(query)) score += 6;
  if (description.includes(query)) score += 4;
  if (excerpt.includes(query)) score += 2;
  if (entry.route.toLowerCase().includes(query)) score += 1;
  return score;
}
