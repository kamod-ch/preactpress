import type { SidebarGroup } from "@preactpress/plugin-typedoc";
import type { ChangelogManifest } from "../types/index.js";
export declare function sidebarFromChangelogManifest(manifest: ChangelogManifest): SidebarGroup[];
export declare function navFromChangelogManifest(manifest: ChangelogManifest): {
  text: string;
  link: string;
};
export declare function versionSidebarsFromManifest(
  manifest: ChangelogManifest,
  versionPrefixes: string[],
): Record<string, SidebarGroup[]>;
//# sourceMappingURL=sidebar.d.ts.map
