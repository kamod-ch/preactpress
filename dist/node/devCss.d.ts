import type { ModuleNode, ViteDevServer } from 'vite';
export declare function isCssModuleId(id: string): boolean;
/** Collect stylesheet URLs reachable from the client entry module graph. */
export declare function collectCssUrlsFromModule(entryMod: ModuleNode): string[];
/** Warm the client graph and return dev stylesheet hrefs for SSR HTML. */
export declare function collectDevStylesheetHrefs(server: ViteDevServer): Promise<string[]>;
//# sourceMappingURL=devCss.d.ts.map