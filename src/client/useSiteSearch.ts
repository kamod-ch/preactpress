import { useEffect, useMemo, useState } from "preact/hooks";
import { publicUrl } from "../shared/url.js";
import { selectSearchEntries, type SearchEntry } from "./searchScore.js";

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

  return useMemo(
    () => selectSearchEntries(entries, query, locale, version, workspace),
    [entries, locale, version, workspace, query],
  );
}
