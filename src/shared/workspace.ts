import type {
  ResolvedI18n,
  ResolvedLocale,
  ResolvedVersion,
  ResolvedVersions,
  ResolvedWorkspace,
  ResolvedWorkspaces,
  ThemeConfig,
} from "../node/siteConfig.js";
import { localeFromRoute, localizeRoute, stripLocalePrefix } from "./locale.js";
import { normalizeRoute } from "./route.js";
import {
  routePathKey as versionRoutePathKey,
  stripVersionPrefix,
  versionFromRoute,
} from "./version.js";

export const DEFAULT_WORKSPACE_LABELS = {
  switcher: "Package",
  version: "Version",
};

export function workspacePrefixForId(id: string): string {
  return normalizeRoute(`/${id}`);
}

export function stripWorkspacePrefix(
  route: string,
  workspace: ResolvedWorkspace | undefined,
): string {
  const normalized = normalizeRoute(route);
  if (!workspace?.prefix) return normalized;
  if (normalized === workspace.prefix) return "/";
  if (normalized.startsWith(`${workspace.prefix}/`)) {
    return normalizeRoute(normalized.slice(workspace.prefix.length));
  }
  return normalized;
}

export function workspaceFromRoute(
  route: string,
  workspaces: ResolvedWorkspaces | undefined,
  i18n?: ResolvedI18n,
  versions?: ResolvedVersions,
): ResolvedWorkspace | undefined {
  if (!workspaces?.enabled) return undefined;
  const locale = localeFromRoute(route, i18n);
  const withoutLocale = stripLocalePrefix(route, locale);
  const withoutVersion = versions?.enabled
    ? stripVersionPrefix(withoutLocale, versionFromRoute(route, versions, i18n))
    : withoutLocale;
  const prefixed = workspaces.workspaces
    .filter((workspace) => workspace.prefix)
    .sort((a, b) => b.prefix.length - a.prefix.length);
  return prefixed.find(
    (workspace) =>
      withoutVersion === workspace.prefix || withoutVersion.startsWith(`${workspace.prefix}/`),
  );
}

export function routePathKeyWithWorkspace(
  route: string,
  i18n: ResolvedI18n | undefined,
  versions?: ResolvedVersions,
  workspaces?: ResolvedWorkspaces,
): string {
  const versionKey = versionRoutePathKey(route, i18n, versions);
  return stripWorkspacePrefix(versionKey, workspaceFromRoute(route, workspaces, i18n, versions));
}

export function composeWorkspaceRoute(
  pathKey: string,
  locale: ResolvedLocale | undefined,
  version: ResolvedVersion | undefined,
  workspace: ResolvedWorkspace | undefined,
): string {
  const normalized = normalizeRoute(pathKey);
  let route = version?.prefix ? normalizeRoute(`${version.prefix}${normalized}`) : normalized;
  if (workspace?.prefix) {
    route =
      route === "/"
        ? workspace.prefix
        : normalizeRoute(`${workspace.prefix}${route === "/" ? "" : route}`);
  }
  if (locale?.prefix) {
    route = localizeRoute(route, locale);
  }
  return route;
}

export function localizedRouteForWorkspace(
  route: string,
  targetWorkspace: ResolvedWorkspace,
  workspaces: ResolvedWorkspaces | undefined,
  versions: ResolvedVersions | undefined,
  i18n: ResolvedI18n | undefined,
  availableRoutes?: ReadonlySet<string>,
): string {
  const pathKey = routePathKeyWithWorkspace(route, i18n, versions, workspaces);
  const locale = localeFromRoute(route, i18n);
  const version = versionFromRoute(route, versions, i18n);
  const localized = composeWorkspaceRoute(pathKey, locale, version, targetWorkspace);
  if (!availableRoutes || availableRoutes.has(localized)) return localized;
  return normalizeRoute(targetWorkspace.link);
}

export function themeConfigForRouteWithWorkspaces(
  themeConfig: ThemeConfig,
  route: string,
  i18n: ResolvedI18n | undefined,
  versions: ResolvedVersions | undefined,
  workspaces: ResolvedWorkspaces | undefined,
): ThemeConfig {
  const workspaceTheme = workspaceFromRoute(route, workspaces, i18n, versions)?.themeConfig;
  const versionTheme = versionFromRoute(route, versions, i18n)?.themeConfig;
  const localeTheme = localeFromRoute(route, i18n)?.themeConfig;
  return {
    ...themeConfig,
    ...workspaceTheme,
    ...versionTheme,
    ...localeTheme,
  };
}

export function switcherWorkspaces(workspaces: ResolvedWorkspaces): ResolvedWorkspace[] {
  return workspaces.workspaces;
}

export function editLinkForPage(
  pattern: string | undefined,
  relativePath: string | undefined,
  workspaceRelativePath?: string,
): string | undefined {
  if (!pattern || !relativePath) return undefined;
  const pathValue = workspaceRelativePath ?? relativePath;
  return pattern.replace(/:path/g, pathValue);
}
