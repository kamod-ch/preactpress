import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import { type ComponentCatalogItem } from "./extract/generate.js";
export interface ComponentReferencePluginOptions {
    /** Pre-built catalog of components to extract statically. */
    catalog?: ComponentCatalogItem[];
    tsconfig?: string;
    gitRemote?: string;
    gitBranch?: string;
    /** Reuse API data produced by @preactpress/plugin-typedoc */
    useTypedocManifest?: boolean;
    typedocManifestPath?: string;
}
/** Official PreactPress plugin for Preact component prop documentation. */
export declare function componentReferencePlugin(options?: ComponentReferencePluginOptions): PreactPressPlugin;
export { buildComponentManifest } from "./extract/generate.js";
export { extractComponentEntry } from "./extract/typescript.js";
export { renderComponentReferenceHtml, lookupComponent } from "./render/html.js";
export type { ComponentManifest, ComponentEntry, ComponentProp } from "./types/index.js";
//# sourceMappingURL=index.d.ts.map