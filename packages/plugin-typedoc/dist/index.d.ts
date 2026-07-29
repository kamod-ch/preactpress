import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import { type TypedocGenerateOptions } from "./extract/generate.js";
export interface TypedocPluginOptions extends TypedocGenerateOptions {}
/** Official PreactPress plugin for TypeDoc API reference pages. */
export declare function typedocPlugin(options: TypedocPluginOptions): PreactPressPlugin;
export { generateApiReference, writeGeneratedPages } from "./extract/generate.js";
export { renderApiDocs } from "./render/markdown.js";
export { mergePathSidebar, navItemFromManifest, sidebarFromManifest } from "./render/sidebar.js";
export { joinRoute, slugifySegment, symbolId } from "./render/slugs.js";
export { relativeHref } from "./render/links.js";
export type {
  ApiManifest,
  ApiSymbol,
  ApiGenerationResult,
  ApiPage,
  ApiTreeNode,
} from "./types/index.js";
export type { SidebarGroup, SidebarItem } from "./render/sidebar-types.js";
//# sourceMappingURL=index.d.ts.map
