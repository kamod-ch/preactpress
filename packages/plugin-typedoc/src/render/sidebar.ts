import type { SidebarGroup, SidebarItem } from "./sidebar-types.js";
import type { ApiManifest, ApiTreeNode } from "../types/index.js";

function treeToSidebarItems(nodes: ApiTreeNode[]): SidebarItem[] {
  return nodes.map((node) => ({
    text: node.text,
    link: node.link,
    items: node.items?.length ? treeToSidebarItems(node.items) : undefined,
  }));
}

export function sidebarFromManifest(manifest: ApiManifest): SidebarGroup[] {
  const groups: SidebarGroup[] = [
    {
      text: "API Reference",
      items: [{ text: "Overview", link: manifest.baseRoute }],
    },
  ];

  if (manifest.tree.length) {
    groups.push({
      text: "Symbols",
      items: treeToSidebarItems(manifest.tree),
    });
  }

  return groups;
}

export function mergePathSidebar(
  existing: SidebarGroup[] | Record<string, SidebarGroup[]> | undefined,
  baseRoute: string,
  generated: SidebarGroup[],
): SidebarGroup[] | Record<string, SidebarGroup[]> {
  const prefix = `${baseRoute.replace(/\/$/, "")}/`;
  if (!existing) {
    return { [prefix]: generated };
  }
  if (Array.isArray(existing)) {
    return [...existing, ...generated];
  }
  return {
    ...existing,
    [prefix]: generated,
  };
}

export function navItemFromManifest(manifest: ApiManifest): { text: string; link: string } {
  return { text: "API", link: manifest.baseRoute };
}
