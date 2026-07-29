import { useEffect } from "preact/hooks";
import type { ResolvedI18n, ResolvedVersions, SiteData } from "../node/siteConfig.js";
import {
  resolvePageHeadMeta,
  titleTemplateFromMeta,
  type PageMetaInput,
} from "../shared/pageMeta.js";
import { headTagsFromMeta } from "../shared/pageHead.js";
import type { HeadTag } from "../node/siteConfig.js";
import { canonicalUrl, publicUrl } from "../shared/url.js";
import { localizedRouteForLocale, siteForRoute } from "../shared/locale.js";
import { canonicalRouteForPage } from "../shared/version.js";

function upsertMeta(selector: "name" | "property", key: string, content: string): void {
  if (!content) return;
  let el = document.head.querySelector(`meta[${selector}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(selector, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function removeMeta(selector: "name" | "property", key: string): void {
  document.head.querySelectorAll(`meta[${selector}="${key}"]`).forEach((el) => el.remove());
}

function appendMeta(selector: "name" | "property", key: string, content: string): void {
  if (!content) return;
  const el = document.createElement("meta");
  el.setAttribute(selector, key);
  el.content = content;
  document.head.appendChild(el);
}

function upsertCanonical(href: string): void {
  if (!href) return;
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeCanonical(): void {
  document.head.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
}

function replaceAlternates(opts: {
  site: SiteData;
  i18n: ResolvedI18n | undefined;
  route: string;
  routes?: ReadonlySet<string>;
}): void {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  if (!opts.site.url || !opts.i18n) return;
  for (const locale of opts.i18n.locales) {
    const route = localizedRouteForLocale(opts.route, locale, opts.i18n, opts.routes);
    if (opts.routes && !opts.routes.has(route)) continue;
    const el = document.createElement("link");
    el.rel = "alternate";
    el.hreflang = locale.lang;
    el.href = canonicalUrl({ url: opts.site.url, base: opts.site.base, route });
    document.head.appendChild(el);
  }
}

function upsertHeadTag(tag: HeadTag): void {
  const [name, attrs, content] = tag;
  if (name === "meta") {
    const key =
      "name" in attrs && attrs.name ? "name" : "property" in attrs ? "property" : undefined;
    if (key && typeof attrs[key] === "string") {
      upsertMeta(key as "name" | "property", String(attrs[key]), String(attrs.content ?? ""));
      return;
    }
  }
  if (name === "link" && attrs.rel && typeof attrs.href === "string") {
    let el = document.head.querySelector(
      `link[rel="${attrs.rel}"]${attrs.hreflang ? `[hreflang="${attrs.hreflang}"]` : ""}`,
    ) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement("link");
      for (const [key, value] of Object.entries(attrs)) {
        if (value != null && value !== false) el.setAttribute(key, String(value));
      }
      document.head.appendChild(el);
    } else {
      el.href = String(attrs.href);
    }
    return;
  }
  if (name === "script") {
    const id = typeof attrs.id === "string" ? attrs.id : undefined;
    let el = id ? (document.getElementById(id) as HTMLScriptElement | null) : null;
    if (!el) {
      el = document.createElement("script");
      for (const [key, value] of Object.entries(attrs)) {
        if (value != null && value !== false) el.setAttribute(key, String(value));
      }
      el.textContent = content ?? "";
      document.head.appendChild(el);
    }
  }
}

function resolveMetaImage(site: SiteData, image: string | undefined): string | undefined {
  if (!image) return undefined;
  if (/^(?:[a-z]+:)?\/\//i.test(image)) return image;
  return site.url ? `${site.url}${publicUrl(site.base, image)}` : publicUrl(site.base, image);
}

export function usePageHead(opts: {
  site: SiteData;
  i18n?: ResolvedI18n;
  versions?: ResolvedVersions;
  routes?: ReadonlySet<string>;
  route: string;
  page: PageMetaInput | undefined;
}): void {
  const { site, i18n, versions, routes, route, page } = opts;
  const activeSite = siteForRoute(site, route, i18n);
  const pageTitle = page?.title;
  const pageDescription = page?.description;
  const pageTags = page?.tags;
  const pageImage = page?.image;
  const pageType = page?.pageType;
  const pageKind = page?.kind;
  const pageHtml = page?.kind === "markdown" ? page.html : undefined;
  const pageMeta = page?.meta;

  useEffect(() => {
    const head = resolvePageHeadMeta(
      pageKind === "markdown"
        ? {
            title: pageTitle,
            titleTemplate: titleTemplateFromMeta(pageMeta),
            description: pageDescription,
            tags: pageTags,
            image: pageImage,
            pageType,
            kind: "markdown",
            html: pageHtml,
          }
        : pageKind
          ? {
              title: pageTitle,
              titleTemplate: titleTemplateFromMeta(pageMeta),
              description: pageDescription,
              tags: pageTags,
              image: pageImage,
              pageType,
              kind: pageKind,
            }
          : undefined,
      activeSite,
    );

    for (const tag of headTagsFromMeta(pageMeta)) upsertHeadTag(tag);

    document.title = head.title;

    upsertMeta("name", "description", head.description);
    upsertMeta("property", "og:title", head.title);
    upsertMeta("property", "og:description", head.description);
    upsertMeta("property", "og:type", head.pageType);
    upsertMeta("name", "twitter:card", head.image ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", head.title);
    upsertMeta("name", "twitter:description", head.description);
    removeMeta("name", "keywords");
    removeMeta("property", "article:tag");
    for (const tag of head.tags) appendMeta("property", "article:tag", tag);

    const image = resolveMetaImage(activeSite, head.image);
    if (image) {
      upsertMeta("property", "og:image", image);
      upsertMeta("name", "twitter:image", image);
    } else {
      removeMeta("property", "og:image");
      removeMeta("name", "twitter:image");
    }

    const canonicalRoute =
      routes && versions?.enabled ? canonicalRouteForPage(route, routes, i18n, versions) : route;
    const canonical = canonicalUrl({
      url: activeSite.url,
      base: activeSite.base,
      route: canonicalRoute,
    });
    if (canonical) {
      upsertMeta("property", "og:url", canonical);
      upsertCanonical(canonical);
    } else {
      removeMeta("property", "og:url");
      removeCanonical();
    }

    replaceAlternates({ site: activeSite, i18n, route, routes });

    if (document.documentElement.lang !== activeSite.lang) {
      document.documentElement.lang = activeSite.lang;
    }
  }, [
    activeSite,
    i18n,
    versions,
    route,
    routes,
    pageTitle,
    pageDescription,
    pageTags,
    pageImage,
    pageType,
    pageKind,
    pageHtml,
    pageMeta,
  ]);
}
