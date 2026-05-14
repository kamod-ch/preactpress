import type { Plugin } from 'vite';
import type { SiteConfig } from './siteConfig.js';
export declare function mdFileToRoute(srcDir: string, file: string): string;
export declare function listMarkdownRoutes(site: SiteConfig): Promise<string[]>;
export declare function preactPressPlugin(site: SiteConfig): Plugin;
//# sourceMappingURL=plugin.d.ts.map