import { type ServerOptions } from 'vite';
export declare function resolveClientEntry(): string;
export declare function createServer(rootArg?: string, serverOptions?: ServerOptions & {
    base?: string;
}): Promise<import('vite').ViteDevServer>;
export type { SiteConfig } from './siteConfig.js';
//# sourceMappingURL=server.d.ts.map