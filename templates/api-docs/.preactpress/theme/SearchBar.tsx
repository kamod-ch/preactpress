import type { FunctionalComponent } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { withBase } from "@kamod-ch/preactpress/client";

interface SearchEntry {
  route: string;
  title?: string;
  description?: string;
  excerpt?: string;
  tags?: string[];
}

interface SearchBarProps {
  base: string;
  enabled: boolean;
}

function scoreEntry(entry: SearchEntry, query: string): number {
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

function searchUrl(base: string): string {
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  return `${b}/preactpress-search.json`;
}

const SearchBar: FunctionalComponent<SearchBarProps> = ({ base, enabled }) => {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch(searchUrl(base), { credentials: "same-origin" })
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
  }, [base, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enabled]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return entries
      .map((entry) => ({ entry, score: scoreEntry(entry, needle) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ entry }) => entry);
  }, [entries, query]);

  if (!enabled) return null;

  const showResults = open && query.trim().length > 0;

  return (
    <div class="protocol-search-wrap" ref={wrapRef}>
      <label class="protocol-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span class="visually-hidden">Search documentation</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Find something..."
          aria-label="Find something"
          aria-expanded={showResults}
          aria-controls="protocol-search-results"
          onInput={(event) => {
            setQuery(event.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <kbd class="protocol-search-kbd" aria-hidden="true">
          Ctrl K
        </kbd>
      </label>
      {showResults ? (
        <ul class="protocol-search-results" id="protocol-search-results" role="listbox">
          {results.length === 0 ? (
            <li class="protocol-search-empty">No results for “{query.trim()}”</li>
          ) : (
            results.map((entry) => (
              <li key={entry.route} role="option">
                <a
                  href={withBase(base, entry.route)}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <strong>{entry.title ?? entry.route}</strong>
                  {entry.description ? <span>{entry.description}</span> : null}
                </a>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
};

export default SearchBar;
