import path from 'node:path';
import { createServer as createViteServer, mergeConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolveConfig } from './config.js';
import { PACKAGE_ROOT } from './packageRoot.js';
import { preactPressPlugin } from './plugin.js';
const CLIENT_ALIAS = 'preactpress/app';
export function resolveClientEntry() {
    return path.join(PACKAGE_ROOT, 'src/client/entry-client.tsx');
}
export async function createServer(rootArg, serverOptions = {}) {
    const site = await resolveConfig(rootArg, 'serve', 'development');
    if (serverOptions.base)
        site.site.base = serverOptions.base;
    const { base: _baseIgnored, ...server } = serverOptions;
    const internal = {
        root: site.srcDir,
        base: site.site.base,
        cacheDir: site.cacheDir,
        customLogger: site.logger,
        appType: 'spa',
        plugins: [preact(), preactPressPlugin(site)],
        resolve: {
            alias: {
                [CLIENT_ALIAS]: resolveClientEntry()
            }
        },
        server: {
            host: true,
            fs: {
                allow: [site.root, PACKAGE_ROOT]
            },
            ...server
        }
    };
    return createViteServer(mergeConfig(mergeConfig(internal, site.vite ?? {}), {
        root: site.srcDir,
        base: site.site.base
    }));
}
//# sourceMappingURL=server.js.map