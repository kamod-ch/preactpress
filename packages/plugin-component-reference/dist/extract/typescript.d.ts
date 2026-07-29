import type { ComponentEntry } from "../types/index.js";
export interface ExtractComponentOptions {
  root: string;
  source: string;
  exportName: string;
  tsconfig?: string;
  gitRemote?: string;
  gitBranch?: string;
}
/** Statically extract component props without executing application code. */
export declare function extractComponentEntry(options: ExtractComponentOptions): ComponentEntry;
//# sourceMappingURL=typescript.d.ts.map
