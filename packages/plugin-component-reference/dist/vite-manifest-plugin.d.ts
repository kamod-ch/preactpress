import type { Plugin } from "vite";
import type { ComponentManifest } from "./types/index.js";
declare const VIRTUAL_ID = "virtual:preactpress-component-manifest";
export declare function componentManifestVirtualPlugin(manifest: ComponentManifest): Plugin;
export declare function writeComponentManifest(configDir: string, manifest: ComponentManifest): Promise<string>;
export { VIRTUAL_ID };
//# sourceMappingURL=vite-manifest-plugin.d.ts.map