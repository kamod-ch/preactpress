export type SearchProvider = "local" | "algolia";

export interface LocalSearchConfig {
  provider: "local";
}

export interface AlgoliaSearchOptions {
  appId?: string;
  apiKey?: string;
  indexName?: string;
  placeholder?: string;
  maxResultsPerGroup?: number;
  disableUserPersonalization?: boolean;
  initialQuery?: string;
  recentSearchesLimit?: number;
  recentSearchesWithFavoritesLimit?: number;
  insights?: boolean;
  searchParameters?: Record<string, unknown>;
  /** Locale-specific overrides (merged with root options). */
  locales?: Record<string, Partial<AlgoliaSearchOptions>>;
}

export interface AlgoliaSearchConfig {
  provider: "algolia";
  options: AlgoliaSearchOptions;
}

/** `true` keeps local sidebar search; use `{ provider }` for explicit providers. */
export type SearchConfig = boolean | LocalSearchConfig | AlgoliaSearchConfig;

export function resolveSearchProvider(search?: SearchConfig): SearchProvider | false {
  if (search === true) return "local";
  if (search === false || search == null) return false;
  return search.provider;
}

export function isLocalSearchEnabled(search?: SearchConfig): boolean {
  return resolveSearchProvider(search) === "local";
}

export function isAlgoliaSearchEnabled(search?: SearchConfig): boolean {
  return resolveSearchProvider(search) === "algolia";
}

export function algoliaOptionsFromSearch(search?: SearchConfig): AlgoliaSearchOptions | undefined {
  if (typeof search === "object" && search.provider === "algolia") return search.options;
  return undefined;
}

export function resolveAlgoliaOptions(
  options: AlgoliaSearchOptions,
  localeKey?: string,
): AlgoliaSearchOptions {
  const { locales, ...root } = options;
  const override = localeKey && locales?.[localeKey] ? locales[localeKey] : {};
  return {
    ...root,
    ...override,
    searchParameters: override.searchParameters ?? root.searchParameters,
  };
}

export function validateAlgoliaCredentials(options: AlgoliaSearchOptions): {
  valid: boolean;
  appId?: string;
  apiKey?: string;
  indexName?: string;
} {
  const appId = options.appId?.trim();
  const apiKey = options.apiKey?.trim();
  const indexName = options.indexName?.trim();
  return {
    valid: Boolean(appId && apiKey && indexName),
    appId,
    apiKey,
    indexName,
  };
}

export function getRelativeDocSearchUrl(url: string, base: string, cleanUrls = true): string {
  const { pathname, hash } = new URL(url, "http://preactpress.local");
  const normalizedBase = base === "/" ? "" : base.replace(/\/$/, "");
  let path = pathname;
  if (normalizedBase && path.startsWith(normalizedBase)) {
    path = path.slice(normalizedBase.length) || "/";
  }
  const route = cleanUrls ? path.replace(/\.html$/, "").replace(/\/index$/, "/") || "/" : path;
  return `${route}${hash}`;
}

export function navigateDocSearchResult(itemUrl: string, base: string): void {
  const url = new URL(itemUrl, window.location.origin);
  const normalizedBase = base === "/" ? "" : base.replace(/\/$/, "");
  const href =
    normalizedBase && !url.pathname.startsWith(normalizedBase)
      ? itemUrl
      : `${normalizedBase}${url.pathname.replace(normalizedBase, "") || "/"}${url.search}${url.hash}`;
  if (url.origin !== window.location.origin) {
    window.location.assign(href);
    return;
  }
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0 });
}
