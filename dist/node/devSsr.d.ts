import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ViteDevServer } from 'vite';
import type { SiteConfig } from './siteConfig.js';
export declare function isDocumentRequest(url: string): boolean;
export declare function createDevSsrMiddleware(site: SiteConfig, server: ViteDevServer): (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => Promise<void>;
//# sourceMappingURL=devSsr.d.ts.map