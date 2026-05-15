import type { Connect } from 'vite';
import type { HeadTag } from './siteConfig.js';
export declare function hasFaviconHead(head: HeadTag[]): boolean;
export declare function defaultFaviconHead(base: string): HeadTag[];
export declare function faviconHtmlTags(base: string): string;
export declare function copyFavicons(outDir: string): Promise<void>;
export declare function faviconRequestPaths(base: string): Set<string>;
export declare function createFaviconMiddleware(base: string): Connect.NextHandleFunction;
//# sourceMappingURL=favicon.d.ts.map