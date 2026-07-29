import type {
  ResolvedI18n,
  ResolvedLocale,
  ResolvedVersion,
  ResolvedVersions,
  ThemeConfig,
  VersionLabels,
} from "../node/siteConfig.js";
import { localeFromRoute, localizeRoute, stripLocalePrefix } from "./locale.js";
import { normalizeRoute } from "./route.js";

export const DEFAULT_VERSION_LABELS: Required<VersionLabels> = {
  switcher: "Version",
  current: "Current",
  archived: "Archived",
  archivedBanner:
    "You are viewing documentation for version {label}. See the {currentLabel} docs for the latest version.",
};

export function versionPrefixForValue(
  value: string,
  isCurrent: boolean,
  versionsDir = "versions",
): string {
  if (isCurrent) return "";
  return normalizeRoute(`/${versionsDir}/${value}`);
}

export function stripVersionPrefix(route: string, version: ResolvedVersion | undefined): string {
  const normalized = normalizeRoute(route);
  if (!version?.prefix) return normalized;
  if (normalized === version.prefix) return "/";
  if (normalized.startsWith(`${version.prefix}/`)) {
    return normalizeRoute(normalized.slice(version.prefix.length));
  }
  return normalized;
}

export function versionFromRoute(
  route: string,
  versions: ResolvedVersions | undefined,
  i18n?: ResolvedI18n,
): ResolvedVersion | undefined {
  if (!versions?.enabled) return undefined;
  const locale = localeFromRoute(route, i18n);
  const normalized = stripLocalePrefix(route, locale);
  const prefixed = versions.versions
    .filter((version) => !version.isAlias && version.prefix)
    .sort((a, b) => b.prefix.length - a.prefix.length);
  const match = prefixed.find(
    (version) => normalized === version.prefix || normalized.startsWith(`${version.prefix}/`),
  );
  if (match) return match;
  return versions.versions.find((version) => version.isCurrent && !version.isAlias);
}

export function routePathKey(
  route: string,
  i18n: ResolvedI18n | undefined,
  versions?: ResolvedVersions,
): string {
  const locale = localeFromRoute(route, i18n);
  const withoutLocale = stripLocalePrefix(route, locale);
  if (!versions?.enabled) return withoutLocale;
  return stripVersionPrefix(withoutLocale, versionFromRoute(route, versions, i18n));
}

export function composeVersionRoute(
  pathKey: string,
  locale: ResolvedLocale | undefined,
  version: ResolvedVersion | undefined,
): string {
  const normalized = normalizeRoute(pathKey);
  let route = version?.prefix ? normalizeRoute(`${version.prefix}${normalized}`) : normalized;
  if (locale?.prefix) {
    route = localizeRoute(route, locale);
  }
  return route;
}

export function localizedRouteForVersion(
  route: string,
  targetVersion: ResolvedVersion,
  versions: ResolvedVersions | undefined,
  i18n: ResolvedI18n | undefined,
  availableRoutes?: ReadonlySet<string>,
): string {
  const pathKey = routePathKey(route, i18n, versions);
  const locale = localeFromRoute(route, i18n);
  const localized = composeVersionRoute(pathKey, locale, targetVersion);
  if (!availableRoutes || availableRoutes.has(localized)) return localized;
  return normalizeRoute(targetVersion.link);
}

export function themeConfigForRouteWithVersions(
  themeConfig: ThemeConfig,
  route: string,
  i18n: ResolvedI18n | undefined,
  versions: ResolvedVersions | undefined,
): ThemeConfig {
  const versionTheme = versionFromRoute(route, versions, i18n)?.themeConfig;
  const localeTheme = localeFromRoute(route, i18n)?.themeConfig;
  return {
    ...themeConfig,
    ...versionTheme,
    ...localeTheme,
  };
}

export function canonicalRouteForPage(
  route: string,
  routes: ReadonlySet<string>,
  i18n: ResolvedI18n | undefined,
  versions: ResolvedVersions | undefined,
): string {
  if (!versions?.enabled) return route;
  const version = versionFromRoute(route, versions, i18n);
  if (!version || version.isCurrent) return route;
  const currentVersion = versions.versions.find((entry) => entry.isCurrent && !entry.isAlias);
  if (!currentVersion) return route;
  const pathKey = routePathKey(route, i18n, versions);
  const locale = localeFromRoute(route, i18n);
  const currentRoute = composeVersionRoute(pathKey, locale, currentVersion);
  return routes.has(currentRoute) ? currentRoute : route;
}

export function renderArchivedBanner(
  template: string,
  version: ResolvedVersion,
  versions: ResolvedVersions,
): string {
  const current = versions.versions.find((entry) => entry.isCurrent && !entry.isAlias);
  return template
    .replaceAll("{version}", version.value)
    .replaceAll("{label}", version.label)
    .replaceAll("{current}", current?.value ?? versions.current)
    .replaceAll("{currentLabel}", current?.label ?? versions.current);
}

export function switcherVersions(versions: ResolvedVersions): ResolvedVersion[] {
  return versions.versions.filter((version) => !version.isAlias || version.key === "latest");
}
