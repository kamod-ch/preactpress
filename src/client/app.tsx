import { useEffect, useRef, useState } from "preact/hooks";
import Layout from "virtual:preactpress-layout";
import { pagesMeta, routes } from "virtual:preactpress-pages";
import { i18n, mpa, site, themeConfig, versions, workspaces, ai } from "virtual:preactpress-site";
import type { PageView } from "./types.js";
import type { ResolvedLocale } from "../node/siteConfig.js";
import { usePageHead } from "./usePageHead.js";
import { normalizeRoute, routeFromPathname } from "../shared/route.js";
import {
  consumeScrollRestoreOnPopstate,
  restoreScrollPositionAfterLayout,
  saveScrollPositionBeforeNavigation,
  scrollToTopAfterLayout,
  setupScrollRestoration,
} from "../shared/scrollRestoration.js";
import { getCachedPage, loadPage, prefetchPage, seedPage } from "./loadPage.js";
import { runClientPlugins } from "./clientPlugins.js";
import { setupViewportPrefetch } from "./prefetchLinks.js";
import { localeFromRoute, localizedRouteForLocale, siteForRoute } from "../shared/locale.js";
import {
  localizedRouteForVersion,
  themeConfigForRouteWithVersions,
  versionFromRoute,
} from "../shared/version.js";
import {
  localizedRouteForWorkspace,
  themeConfigForRouteWithWorkspaces,
  workspaceFromRoute,
} from "../shared/workspace.js";
import type { ResolvedVersion, ResolvedWorkspace } from "../node/siteConfig.js";

function routeFromLocation(): string {
  return routeFromPathname(window.location.pathname, site.base);
}

function routeFromHref(href: string): string | undefined {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return undefined;
  const base = site.base === "/" ? "" : site.base.replace(/\/$/, "");
  if (base && url.pathname !== base && !url.pathname.startsWith(`${base}/`)) {
    return undefined;
  }
  const path = base ? url.pathname.slice(base.length) || "/" : url.pathname;
  return normalizeRoute(path);
}

function anchorFromEvent(event: MouseEvent): HTMLAnchorElement | null {
  const target = event.target;
  const element =
    target instanceof Element ? target : target instanceof Text ? target.parentElement : null;
  return element?.closest("a[href]") ?? null;
}

function loadingPage(route: string): PageView {
  const meta = pagesMeta[route];
  return {
    kind: "markdown",
    html: "<p>Loading...</p>",
    title: meta?.title,
    description: meta?.description,
    tags: meta?.tags,
    image: meta?.image,
    pageType: meta?.pageType,
    meta: meta?.meta ?? {},
    headings: meta?.headings ?? [],
  };
}

export function App({ routePath, initialPage }: { routePath: string; initialPage?: PageView }) {
  const [currentRoute, setCurrentRoute] = useState(() => normalizeRoute(routePath));
  const [page, setPage] = useState<PageView>(() => initialPage ?? loadingPage(routePath));
  const pendingScrollRestore = useRef(false);
  const pendingScrollTop = useRef(false);
  const [scrollRestoreNonce, setScrollRestoreNonce] = useState(0);
  const [scrollTopNonce, setScrollTopNonce] = useState(0);
  const availableRoutes = new Set(routes);
  const activeLocale = localeFromRoute(currentRoute, i18n);
  const activeVersion = versionFromRoute(currentRoute, versions, i18n);
  const activeWorkspace = workspaceFromRoute(currentRoute, workspaces, i18n, versions);
  const activeSite = siteForRoute(site, currentRoute, i18n);
  const activeThemeConfig = themeConfigForRouteWithWorkspaces(
    themeConfigForRouteWithVersions(themeConfig, currentRoute, i18n, versions),
    currentRoute,
    i18n,
    versions,
    workspaces,
  );

  useEffect(() => {
    if (initialPage) seedPage(normalizeRoute(routePath), initialPage);
  }, [initialPage, routePath]);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedPage(currentRoute);
    if (!cached) setPage(loadingPage(currentRoute));
    void loadPage(currentRoute, site.base)
      .then((loaded) => {
        if (!cancelled) {
          setPage(loaded);
          if (pendingScrollRestore.current) {
            pendingScrollRestore.current = false;
            setScrollRestoreNonce((nonce) => nonce + 1);
          } else if (pendingScrollTop.current) {
            pendingScrollTop.current = false;
            setScrollTopNonce((nonce) => nonce + 1);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPage({
            kind: "markdown",
            html: "<p>Page not found.</p>",
            title: "404",
            description: activeSite.description,
            meta: {},
            headings: [],
          });
          if (pendingScrollRestore.current) {
            pendingScrollRestore.current = false;
            setScrollRestoreNonce((nonce) => nonce + 1);
          } else if (pendingScrollTop.current) {
            pendingScrollTop.current = false;
            setScrollTopNonce((nonce) => nonce + 1);
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeSite.description, currentRoute]);

  useEffect(() => {
    if (scrollRestoreNonce === 0) return;
    void restoreScrollPositionAfterLayout();
  }, [scrollRestoreNonce]);

  useEffect(() => {
    if (scrollTopNonce === 0) return;
    void scrollToTopAfterLayout();
  }, [scrollTopNonce]);

  useEffect(() => {
    const prefetch = (route: string) => prefetchPage(route, site.base);
    const stopViewportPrefetch = setupViewportPrefetch(routeFromHref, prefetch);
    if (mpa) {
      return () => stopViewportPrefetch();
    }

    const stopScrollRestoration = setupScrollRestoration();
    const onPopState = () => {
      if (consumeScrollRestoreOnPopstate()) {
        pendingScrollRestore.current = true;
      }
      setCurrentRoute(routeFromLocation());
    };
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }
      const link = anchorFromEvent(event);
      if (!link || link.target || link.hasAttribute("download")) return;
      const route = routeFromHref(link.href);
      if (!route) return;
      const url = new URL(link.href);
      if (url.hash && route === currentRoute) {
        document.getElementById(url.hash.slice(1))?.scrollIntoView();
        return;
      }
      event.preventDefault();
      saveScrollPositionBeforeNavigation();
      pendingScrollTop.current = true;
      window.history.pushState({}, "", url);
      setCurrentRoute(route);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };
    const onMouseEnter = (event: MouseEvent) => {
      const link = anchorFromEvent(event);
      if (!link) return;
      const route = routeFromHref(link.href);
      if (route) prefetch(route);
    };
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick);
    document.addEventListener("mouseenter", onMouseEnter, true);
    return () => {
      stopScrollRestoration();
      stopViewportPrefetch();
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mouseenter", onMouseEnter, true);
    };
  }, [currentRoute, mpa]);

  useEffect(() => {
    void runClientPlugins();
  }, [currentRoute, page]);

  useEffect(() => {
    if (currentRoute !== normalizeRoute(routePath)) {
      document.getElementById("content")?.focus({ preventScroll: true });
    }
  }, [currentRoute, routePath]);

  usePageHead({
    site,
    i18n,
    versions,
    routes: availableRoutes,
    route: currentRoute,
    page:
      page?.kind === "markdown"
        ? {
            meta: page.meta,
            title: page.title,
            description: page.description,
            tags: page.tags,
            image: page.image,
            pageType: page.pageType,
            kind: "markdown",
            html: page.html,
          }
        : page
          ? {
              meta: page.meta,
              title: page.title,
              description: page.description,
              tags: page.tags,
              image: page.image,
              pageType: page.pageType,
              kind: "mdx",
            }
          : undefined,
  });

  return (
    <Layout
      site={activeSite}
      themeConfig={activeThemeConfig}
      routePath={currentRoute}
      page={page}
      ai={ai}
      i18n={i18n}
      locale={activeLocale}
      locales={i18n?.locales}
      localizeRoute={(locale: ResolvedLocale) =>
        localizedRouteForLocale(currentRoute, locale, i18n, availableRoutes)
      }
      versions={versions?.enabled ? versions : undefined}
      version={activeVersion}
      localizeVersion={(target: ResolvedVersion) =>
        localizedRouteForVersion(currentRoute, target, versions, i18n, availableRoutes)
      }
      workspaces={workspaces?.enabled ? workspaces : undefined}
      workspace={activeWorkspace}
      localizeWorkspace={(target: ResolvedWorkspace) =>
        localizedRouteForWorkspace(
          currentRoute,
          target,
          workspaces,
          versions,
          i18n,
          availableRoutes,
        )
      }
      archivedBanner={
        activeVersion && !activeVersion.isCurrent && versions?.enabled
          ? versions.labels.archivedBanner
              .replaceAll("{version}", activeVersion.value)
              .replaceAll("{label}", activeVersion.label)
              .replaceAll("{current}", versions.current)
              .replaceAll(
                "{currentLabel}",
                versions.versions.find((entry) => entry.isCurrent && !entry.isAlias)?.label ??
                  versions.current,
              )
          : undefined
      }
    />
  );
}
