import fs from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { ViteDevServer } from "vite";
import { routeFromPathname } from "../shared/route.js";
import { collectDevStylesheetHrefs } from "./devCss.js";
import { injectDevPageDocument } from "./html.js";
import { applyTransformHtml, applyTransformPageData } from "./hooks.js";
import { PACKAGE_ROOT } from "./packageRoot.js";
import type { SiteConfig } from "./siteConfig.js";
import type { PageView } from "../client/types.js";
import { serializablePageForClient } from "../shared/aiMarkdown.js";
import type { ContentFile } from "./content.js";
import { hydrateRoutePage } from "./pageHydration.js";

function ssrEntry(): string {
  return path.join(PACKAGE_ROOT, "src/client/entry-ssr.tsx");
}

export function isDocumentRequest(url: string): boolean {
  const pathname = url.split("?")[0]?.split("#")[0] ?? "/";
  if (!pathname || pathname.startsWith("/@") || pathname.startsWith("/__")) return false;
  if (pathname.includes("/node_modules/")) return false;
  if (pathname.startsWith("/assets/")) return false;
  const last = pathname.split("/").pop() ?? "";
  if (last.includes(".") && !last.endsWith(".html")) return false;
  return true;
}

export function createDevSsrMiddleware(
  site: SiteConfig,
  server: ViteDevServer,
  getRouteFile: (route: string) => ContentFile | undefined,
  getRoutes: () => string[],
) {
  const indexPath = path.join(site.srcDir, "index.html");
  const ssrId = ssrEntry();
  const cache = {
    indexTemplate: undefined as string | undefined,
    devStylesheets: undefined as string[] | undefined,
  };

  const invalidateDevStyles = (): void => {
    cache.devStylesheets = undefined;
  };

  server.watcher.on("change", (file) => {
    if (path.resolve(String(file)) === indexPath) cache.indexTemplate = undefined;
    invalidateDevStyles();
  });

  async function devStylesheets(): Promise<string[]> {
    if (!cache.devStylesheets) {
      cache.devStylesheets = await collectDevStylesheetHrefs(server);
    }
    return cache.devStylesheets;
  }

  return async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const rawUrl = req.url ?? "/";
    if (isDevPageDataRequest(rawUrl, site.site.base)) {
      try {
        const route = new URL(rawUrl, "http://preactpress.local").searchParams.get("route") ?? "/";
        const mod = (await server.ssrLoadModule(ssrId)) as {
          resolveRoutePage: (routePath: string) => PageView;
        };
        const resolved = mod.resolveRoutePage(route);
        const page = await applyTransformPageData(
          site,
          route,
          await hydrateRoutePage(site, route, resolved, getRouteFile(route), getRoutes()),
        );
        const payload =
          page.kind === "markdown"
            ? serializablePageForClient(page, site.ai !== false && site.ai.copyMarkdown)
            : { ...page, Component: undefined };
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        res.end(JSON.stringify(payload));
        return;
      } catch (err) {
        site.logger.warn(
          `preactpress page data failed for ${rawUrl}: ${err instanceof Error ? err.message : err}`,
        );
        next();
        return;
      }
    }
    if (!isDocumentRequest(rawUrl)) return next();

    try {
      if (!cache.indexTemplate) {
        cache.indexTemplate = await fs.readFile(indexPath, "utf8");
      }
      const route = routeFromPathname(rawUrl.split("?")[0]?.split("#")[0] ?? "/", site.site.base);
      const mod = (await server.ssrLoadModule(ssrId)) as {
        resolveRoutePage: (routePath: string) => PageView;
        renderFromPage: (
          routePath: string,
          page: PageView,
        ) => {
          body: string;
          title: string;
          description: string;
          tags: string[];
          image?: string;
          pageType: "website" | "article";
          page: PageView;
        };
      };
      const resolved = mod.resolveRoutePage(route);
      const page = await applyTransformPageData(
        site,
        route,
        await hydrateRoutePage(site, route, resolved, getRouteFile(route), getRoutes()),
      );
      const {
        body,
        title,
        description,
        tags,
        image,
        pageType,
        page: renderedPage,
      } = mod.renderFromPage(route, page);
      const indexUrl = site.site.base === "/" ? "/" : `${site.site.base}/`;
      const transformed = await server.transformIndexHtml(indexUrl, cache.indexTemplate);
      const html = await applyTransformHtml(
        site,
        await injectDevPageDocument(transformed, {
          site,
          body,
          title,
          description,
          tags,
          image,
          pageType,
          pageData: renderedPage,
          route,
          devStylesheets: await devStylesheets(),
        }),
        route,
        renderedPage,
      );
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      res.end(html);
    } catch (err) {
      site.logger.warn(
        `preactpress dev SSR failed for ${rawUrl}: ${err instanceof Error ? err.message : err}`,
      );
      next();
    }
  };
}

function isDevPageDataRequest(rawUrl: string, base: string): boolean {
  const pathname = rawUrl.split("?")[0]?.split("#")[0] ?? "";
  const basePath = base === "/" ? "" : base.replace(/\/$/, "");
  return pathname === `${basePath}/__preactpress/page.json`;
}
