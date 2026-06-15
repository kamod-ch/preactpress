import type { ContentFile } from "../node/content.js";
import { normalizeRoute } from "./route.js";

export type RouteRewrites = Record<string, string>;

export function normalizeRewriteRoute(route: string): string {
  return normalizeRoute(route);
}

export function applyRouteRewrites(
  routeToFile: Map<string, ContentFile>,
  rewrites: RouteRewrites,
): void {
  for (const [aliasRaw, sourceRaw] of Object.entries(rewrites)) {
    const alias = normalizeRewriteRoute(aliasRaw);
    const source = normalizeRewriteRoute(sourceRaw);
    const sourceFile = routeToFile.get(source);
    if (!sourceFile) {
      throw new Error(`preactpress: rewrite source route not found: ${sourceRaw} (${source})`);
    }
    const existing = routeToFile.get(alias);
    if (existing && existing.file !== sourceFile.file) {
      throw new Error(
        `preactpress: rewrite collision for ${alias}: ${pathLabel(existing)} and ${pathLabel(sourceFile)}`,
      );
    }
    routeToFile.set(alias, { ...sourceFile, route: alias });
  }
}

function pathLabel(file: ContentFile): string {
  return file.route === "/" ? "/" : file.route;
}
