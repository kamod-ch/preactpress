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

/** One insertion, deletion or substitution; adjacent transpositions count as two edits. */
function withinOneEdit(left: string[], right: string[]): boolean {
  if (Math.abs(left.length - right.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (left.length >= right.length) i++;
    if (right.length >= left.length) j++;
  }
  return edits + Number(i < left.length || j < right.length) <= 1;
}

function words(text: string): string[][] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).map((word) => Array.from(word));
}

/** Internal local-search selection; filters also bound the no-regular-results decision. */
export function selectSearchEntries(
  entries: SearchEntry[],
  query: string,
  locale?: string,
  version?: string,
  workspace?: string,
): SearchEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const candidates = entries.filter(
    (entry) =>
      (!locale || entry.locale === locale) &&
      (!version || entry.version === version) &&
      (!workspace || entry.workspace === workspace),
  );
  const regular = candidates
    .map((entry, index) => ({ entry, index, score: scoreSearchEntry(entry, needle) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  if (regular.length) return regular.slice(0, 8).map(({ entry }) => entry);

  const tokens = words(needle);
  if (!tokens.length || tokens.some((token) => token.length < 5)) return [];
  // Equal fallback matches retain index order, just like equal regular scores.
  return candidates
    .filter((entry) => {
      const titleWords = words(entry.title ?? "").filter((word) => word.length >= 5);
      return tokens.every((token) => titleWords.some((word) => withinOneEdit(token, word)));
    })
    .slice(0, 8);
}
