import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
export interface MermaidPluginOptions {
    /** Language ids handled by this plugin. Defaults to `["mermaid"]`. */
    languages?: string[];
}
/** Official PreactPress plugin for Mermaid diagram blocks. */
export declare function mermaidPlugin(options?: MermaidPluginOptions): PreactPressPlugin;
export { renderMermaidFenceHtml } from "./fence.js";
//# sourceMappingURL=index.d.ts.map