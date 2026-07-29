import type { ComponentEntry, ComponentManifest } from "../types/index.js";
/** Render a component reference as static HTML for markdown pages and SSR. */
export declare function renderComponentReferenceHtml(entry: ComponentEntry): string;
export declare function componentSearchTags(entry: ComponentEntry): string[];
export declare function lookupComponent(
  manifest: ComponentManifest,
  lookup: {
    component?: string;
    source?: string;
    exportName?: string;
  },
): ComponentEntry | undefined;
//# sourceMappingURL=html.d.ts.map
