import type { DocSearchInstance, DocSearchProps } from "@docsearch/js/docsearch";
import type { FunctionalComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import type { AlgoliaSearchOptions } from "../../shared/search.js";
import {
  getRelativeDocSearchUrl,
  navigateDocSearchResult,
  validateAlgoliaCredentials,
} from "../../shared/search.js";

export interface AlgoliaSearchProps {
  options: AlgoliaSearchOptions;
  base: string;
  cleanUrls?: boolean;
  containerId?: string;
}

const AlgoliaSearch: FunctionalComponent<AlgoliaSearchProps> = ({
  options,
  base,
  cleanUrls = true,
  containerId = "pp-docsearch",
}) => {
  const initKey = useRef(0);

  useEffect(() => {
    const credentials = validateAlgoliaCredentials(options);
    if (!credentials.valid) return;

    // Keep DocSearch's sizeable stylesheet out of sites that do not enable Algolia search.
    void import("@docsearch/css");

    const currentInit = ++initKey.current;
    let destroy: (() => void) | undefined;
    let cancelled = false;

    void import("@docsearch/js/docsearch").then((mod) => {
      if (cancelled || currentInit !== initKey.current) return;
      const docsearch = mod.default as unknown as (props: DocSearchProps) => DocSearchInstance;
      const instance = docsearch({
        container: `#${containerId}`,
        appId: credentials.appId!,
        apiKey: credentials.apiKey!,
        indices: [
          {
            name: credentials.indexName!,
            searchParameters: options.searchParameters,
          },
        ] as DocSearchProps["indices"],
        placeholder: options.placeholder,
        maxResultsPerGroup: options.maxResultsPerGroup,
        disableUserPersonalization: options.disableUserPersonalization,
        initialQuery: options.initialQuery,
        recentSearchesLimit: options.recentSearchesLimit,
        recentSearchesWithFavoritesLimit: options.recentSearchesWithFavoritesLimit,
        insights: options.insights,
        navigator: {
          navigate({ itemUrl }: { itemUrl: string }) {
            navigateDocSearchResult(itemUrl, base);
          },
        },
        transformItems: (items) =>
          items.map((item) => ({
            ...item,
            url: getRelativeDocSearchUrl(item.url, base, cleanUrls),
          })),
        keyboardShortcuts: {
          "/": false,
          "Ctrl/Cmd+K": false,
        },
      });
      destroy = () => instance.destroy();
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [base, cleanUrls, containerId, options]);

  useEffect(() => {
    const appId = options.appId?.trim();
    if (!appId || document.getElementById("pp-docsearch-preconnect")) return;
    const link = document.createElement("link");
    link.id = "pp-docsearch-preconnect";
    link.rel = "preconnect";
    link.href = `https://${appId}-dsn.algolia.net`;
    link.crossOrigin = "";
    document.head.appendChild(link);
  }, [options.appId]);

  return <div id={containerId} class="pp-docsearch" />;
};

export default AlgoliaSearch;
