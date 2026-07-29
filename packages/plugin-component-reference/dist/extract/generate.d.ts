import type { ComponentManifest } from "../types/index.js";
export interface ComponentCatalogItem {
  component?: string;
  source: string;
  exportName: string;
}
export interface BuildComponentManifestOptions {
  root: string;
  configDir: string;
  tsconfig?: string;
  gitRemote?: string;
  gitBranch?: string;
  catalog?: ComponentCatalogItem[];
  apiManifestPath?: string;
}
export declare function buildComponentManifest(
  options: BuildComponentManifestOptions,
): Promise<ComponentManifest>;
export declare function defaultApiManifestPath(configDir: string): Promise<string>;
//# sourceMappingURL=generate.d.ts.map
