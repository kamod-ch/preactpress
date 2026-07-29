import type { ApiManifest } from "@preactpress/plugin-typedoc/types";
import type { ComponentEntry, ComponentManifest } from "../types/index.js";
/** Map typedoc ApiManifest symbols tagged as components into ComponentManifest entries. */
export declare function componentsFromApiManifest(
  manifest: ApiManifest,
): Record<string, ComponentEntry>;
export declare function mergeComponentManifests(
  base: ComponentManifest,
  extra: Record<string, ComponentEntry>,
): ComponentManifest;
//# sourceMappingURL=from-api-manifest.d.ts.map
