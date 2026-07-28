import type { PageView } from "../client/types.js";
import type { SiteConfig } from "./siteConfig.js";
import {
  applyPluginsTransformPageData,
  invokePluginsBuildEnd,
} from "./pluginRuntime.js";
import type { BuildResult } from "./pluginTypes.js";

export async function applyTransformPageData(
  site: SiteConfig,
  route: string,
  page: PageView,
  context?: { command?: "serve" | "build"; mode?: string },
): Promise<PageView> {
  return applyPluginsTransformPageData(site, route, page, context);
}

export async function applyTransformHtml(
  site: SiteConfig,
  html: string,
  route: string,
  page?: PageView,
): Promise<string> {
  if (!site.transformHtml) return html;
  const { siteForRoute } = await import("../shared/locale.js");
  const activeSite = siteForRoute(site.site, route, site.i18n);
  return site.transformHtml(html, { route, site: activeSite, page });
}

export async function invokeBuildEnd(
  site: SiteConfig,
  pages: Array<{ route: string; page: PageView }>,
  context?: { command?: "serve" | "build"; mode?: string },
): Promise<void> {
  const result: BuildResult = {
    routes: site.routes ?? pages.map((entry) => entry.route),
    pages,
    outDir: site.outDir,
  };
  await invokePluginsBuildEnd(site, result, context);
}
