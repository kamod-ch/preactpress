import { useEffect, useMemo, useState } from "preact/hooks";
import { publicUrl } from "../shared/url.js";
import { scoreSearchEntry, type SearchEntry } from "./searchScore.js";

export type { SearchEntry } from "./searchScore.js";

export function useSiteSearch(
  base: string,
  query: string,
  locale?: string,
  version?: string,
  workspace?: string,
): SearchEntry[] {
  const [entries, setEntries] = useState<SearchEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(publicUrl(base, "preactpress-search.json"), { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setEntries(data as SearchEntry[]);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [base]);

  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return entries
      .filter((entry) => !locale || entry.locale === locale)
      .filter((entry) => !version || entry.version === version)
      .filter((entry) => !workspace || entry.workspace === workspace)
      .map((entry) => ({ entry, score: scoreSearchEntry(entry, needle) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ entry }) => entry);
  }, [entries, locale, version, workspace, query]);
}
