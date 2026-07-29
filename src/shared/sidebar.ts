import type {
  NavItem,
  ResolvedI18n,
  ResolvedVersions,
  ResolvedWorkspaces,
  SidebarGroup,
  SidebarItem,
} from "../node/siteConfig.js";
import { routePathKey as localeRoutePathKey } from "./locale.js";
import { routePathKey as versionRoutePathKey } from "./version.js";
import { routePathKeyWithWorkspace } from "./workspace.js";
import { localeFromRoute, stripLocalePrefix } from "./locale.js";
import { stripVersionPrefix, versionFromRoute } from "./version.js";
import { normalizeRoute } from "./route.js";

export type SidebarConfig = SidebarGroup[] | Record<string, SidebarGroup[]>;

function resolveRoutePathKey(
  route: string,
  i18n?: ResolvedI18n,
  versions?: ResolvedVersions,
  workspaces?: ResolvedWorkspaces,
): string {
  if (workspaces?.enabled) {
    const locale = localeFromRoute(route, i18n);
    const withoutLocale = stripLocalePrefix(route, locale);
    if (versions?.enabled) {
      return stripVersionPrefix(withoutLocale, versionFromRoute(route, versions, i18n));
    }
    return withoutLocale;
  }
  return versions?.enabled
    ? versionRoutePathKey(route, i18n, versions)
    : localeRoutePathKey(route, i18n);
}

/** Path key with workspace prefix stripped — for pagination and cross-workspace links. */
export function contentPathKey(
  route: string,
  i18n?: ResolvedI18n,
  versions?: ResolvedVersions,
  workspaces?: ResolvedWorkspaces,
): string {
  if (workspaces?.enabled) {
    return routePathKeyWithWorkspace(route, i18n, versions, workspaces);
  }
  return resolveRoutePathKey(route, i18n, versions, workspaces);
}

export function isPathSidebarConfig(
  sidebar: SidebarConfig | undefined,
): sidebar is Record<string, SidebarGroup[]> {
  return Boolean(sidebar && !Array.isArray(sidebar));
}

export function resolveSidebarForRoute(
  sidebar: SidebarConfig | undefined,
  route: string,
  i18n?: ResolvedI18n,
  versions?: ResolvedVersions,
  workspaces?: ResolvedWorkspaces,
): SidebarGroup[] {
  if (!sidebar) return [];
  if (Array.isArray(sidebar)) return sidebar;

  const pathKey = resolveRoutePathKey(route, i18n, versions, workspaces);
  const entries = Object.entries(sidebar)
    .map(([prefix, groups]) => ({ prefix: normalizeRoute(prefix), groups }))
    .filter(({ prefix }) => prefix !== "/")
    .sort((a, b) => b.prefix.length - a.prefix.length);

  for (const { prefix, groups } of entries) {
    if (pathKey === prefix || pathKey.startsWith(`${prefix}/`)) {
      return groups;
    }
  }

  return sidebar["/"] ?? sidebar[""] ?? [];
}

export function flattenSidebarLeafItems(
  items: SidebarItem[],
): Array<{ text: string; link: string }> {
  const out: Array<{ text: string; link: string }> = [];
  for (const item of items) {
    if (item.link) out.push({ text: item.text, link: item.link });
    if (item.items?.length) out.push(...flattenSidebarLeafItems(item.items));
  }
  return out;
}

export function flattenSidebarItems(
  sidebar: SidebarConfig | undefined,
): Array<{ text: string; link: string }> {
  return allSidebarGroups(sidebar).flatMap((group) => flattenSidebarLeafItems(group.items));
}

export function flattenNavLeafItems(
  items: NavItem[] | undefined,
): Array<{ text: string; link: string }> {
  const out: Array<{ text: string; link: string }> = [];
  for (const item of items ?? []) {
    if (item.link) out.push({ text: item.text, link: item.link });
    if (item.items?.length) out.push(...flattenNavLeafItems(item.items));
  }
  return out;
}

export function allSidebarGroups(sidebar: SidebarConfig | undefined): SidebarGroup[] {
  if (!sidebar) return [];
  return Array.isArray(sidebar) ? sidebar : Object.values(sidebar).flat();
}
