import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import type { PlaygroundPluginOptions } from "./types.js";
/** Official PreactPress plugin for live Preact code playgrounds in MDX. */
export declare function playgroundPlugin(options?: PlaygroundPluginOptions): PreactPressPlugin;
export type { PlaygroundPluginOptions, PlaygroundProps } from "./types.js";
export { resolvePlaygroundFiles, serializeFilesForDisplay } from "./files.js";
export { createDependencyContext, resolveImportMap } from "./dependencies.js";
export { renderPlaygroundFallbackHtml } from "./static.js";
//# sourceMappingURL=index.d.ts.map
