import type { SidebarGroup, SidebarItem } from "@preactpress/plugin-typedoc";
import type { ApiTreeNode } from "@preactpress/plugin-typedoc/types";
import type { OpenApiManifest } from "../types/index.js";

function treeToSidebarItems(nodes: ApiTreeNode[]): SidebarItem[] {
  return nodes.map((node) => ({
    text: node.text,
    link: node.link,
    items: node.items?.length ? treeToSidebarItems(node.items) : undefined,
  }));
}

export function sidebarFromOpenApiManifest(manifest: OpenApiManifest): SidebarGroup[] {
  const groups: SidebarGroup[] = [
    {
      text: "OpenAPI",
      items: [
        { text: "Overview", link: manifest.baseRoute },
        { text: "Schemas", link: `${manifest.baseRoute}/schemas` },
      ],
    },
  ];

  if (manifest.tree.length) {
    groups.push({
      text: "Endpoints",
      items: treeToSidebarItems(manifest.tree.filter((node) => node.id !== "schemas")),
    });
  }

  return groups;
}

export function navFromOpenApiManifest(manifest: OpenApiManifest): { text: string; link: string } {
  return { text: "API", link: manifest.baseRoute };
}
