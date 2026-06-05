import type { NavItem, ResolvedI18n, SidebarGroup, SidebarItem } from '../node/siteConfig.js'
import { routePathKey } from './locale.js'
import { normalizeRoute } from './route.js'

export type SidebarConfig = SidebarGroup[] | Record<string, SidebarGroup[]>

export function isPathSidebarConfig(
  sidebar: SidebarConfig | undefined
): sidebar is Record<string, SidebarGroup[]> {
  return Boolean(sidebar && !Array.isArray(sidebar))
}

export function resolveSidebarForRoute(
  sidebar: SidebarConfig | undefined,
  route: string,
  i18n?: ResolvedI18n
): SidebarGroup[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar

  const pathKey = routePathKey(route, i18n)
  const entries = Object.entries(sidebar)
    .map(([prefix, groups]) => ({ prefix: normalizeRoute(prefix), groups }))
    .filter(({ prefix }) => prefix !== '/')
    .sort((a, b) => b.prefix.length - a.prefix.length)

  for (const { prefix, groups } of entries) {
    if (pathKey === prefix || pathKey.startsWith(`${prefix}/`)) {
      return groups
    }
  }

  return sidebar['/'] ?? sidebar[''] ?? []
}

export function flattenSidebarLeafItems(
  items: SidebarItem[]
): Array<{ text: string; link: string }> {
  const out: Array<{ text: string; link: string }> = []
  for (const item of items) {
    if (item.link) out.push({ text: item.text, link: item.link })
    if (item.items?.length) out.push(...flattenSidebarLeafItems(item.items))
  }
  return out
}

export function flattenSidebarItems(
  sidebar: SidebarConfig | undefined
): Array<{ text: string; link: string }> {
  return allSidebarGroups(sidebar).flatMap((group) => flattenSidebarLeafItems(group.items))
}

export function flattenNavLeafItems(
  items: NavItem[] | undefined
): Array<{ text: string; link: string }> {
  const out: Array<{ text: string; link: string }> = []
  for (const item of items ?? []) {
    if (item.link) out.push({ text: item.text, link: item.link })
    if (item.items?.length) out.push(...flattenNavLeafItems(item.items))
  }
  return out
}

export function allSidebarGroups(sidebar: SidebarConfig | undefined): SidebarGroup[] {
  if (!sidebar) return []
  return Array.isArray(sidebar) ? sidebar : Object.values(sidebar).flat()
}
