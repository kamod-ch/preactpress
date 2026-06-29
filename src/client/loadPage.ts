import { mdxLoaders, pagesMeta } from "virtual:preactpress-pages";
import type { HtmlPageView, PageView } from "./types.js";
import { contentChunkPath } from "../shared/contentChunk.js";
import { publicUrl } from "../shared/url.js";

const cache = new Map<string, PageView>();

function fallbackPage(): PageView {
  return (
    cache.get("/404") ??
    ({
      kind: "markdown",
      html: "<p>Page not found.</p>",
      title: "404",
      description: undefined,
      meta: {},
      headings: [],
    } satisfies HtmlPageView)
  );
}

export function seedPage(route: string, page: PageView | undefined): void {
  if (page) cache.set(route, page);
}

export function getCachedPage(route: string): PageView | undefined {
  return cache.get(route);
}

async function loadMarkdownPage(route: string, base: string): Promise<PageView> {
  const meta = pagesMeta[route];
  const url = import.meta.env.DEV
    ? publicUrl(base, `/__preactpress/page.json?route=${encodeURIComponent(route)}`)
    : publicUrl(base, contentChunkPath(route));
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Failed to load page ${route}`);
  const data = (await res.json()) as HtmlPageView;
  return {
    ...meta,
    ...data,
    kind: "markdown",
  };
}

export async function loadPage(route: string, base: string): Promise<PageView> {
  const cached = cache.get(route);
  if (cached) return cached;

  const meta = pagesMeta[route];
  if (!meta) return fallbackPage();

  if (meta.kind === "mdx") {
    const loader = mdxLoaders[route];
    if (!loader) return fallbackPage();
    const mod = await loader();
    const page = { ...meta, kind: "mdx" as const, Component: mod.default };
    cache.set(route, page);
    return page;
  }

  const page = await loadMarkdownPage(route, base);
  cache.set(route, page);
  return page;
}

export function prefetchPage(route: string, base: string): void {
  if (cache.has(route)) return;
  void loadPage(route, base).catch(() => {
    /* Prefetch failures should not affect navigation. */
  });
}
