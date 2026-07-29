import type { SidebarGroup } from "./sidebar-types.js";
import type { ApiManifest } from "../types/index.js";
export declare function sidebarFromManifest(manifest: ApiManifest): SidebarGroup[];
export declare function mergePathSidebar(
  existing: SidebarGroup[] | Record<string, SidebarGroup[]> | undefined,
  baseRoute: string,
  generated: SidebarGroup[],
): SidebarGroup[] | Record<string, SidebarGroup[]>;
export declare function navItemFromManifest(manifest: ApiManifest): {
  text: string;
  link: string;
};
//# sourceMappingURL=sidebar.d.ts.map
