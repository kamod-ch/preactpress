import type { Plugin } from 'vite';
import type { SiteConfig } from './siteConfig.js';
import { mdFileToRoute } from './content.js';
export { mdFileToRoute };
export declare function listMarkdownRoutes(site: SiteConfig): Promise<string[]>;
export declare function preactPressPlugin(site: SiteConfig): Plugin;
//# sourceMappingURL=plugin.d.ts.map