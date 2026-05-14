import path from 'node:path';
import { createServer as createViteServer, mergeConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolveConfig } from './config.js';
import { PACKAGE_ROOT } from './packageRoot.js';
import { preactPressMdxPlugin } from './mdx.js';
import { preactPressPlugin } from './plugin.js';
import { resolveDependency } from './resolveDeps.js';
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
        plugins: [preactPressMdxPlugin(), preact(), preactPressPlugin(site)],
        resolve: {
            alias: [
                { find: CLIENT_ALIAS, replacement: resolveClientEntry() },
                { find: /^preact\/jsx-dev-runtime$/, replacement: resolveDependency('preact/jsx-dev-runtime') },
                { find: /^preact\/jsx-runtime$/, replacement: resolveDependency('preact/jsx-runtime') },
                { find: /^preact\/devtools$/, replacement: resolveDependency('preact/devtools') },
                { find: /^preact\/hooks$/, replacement: resolveDependency('preact/hooks') },
                { find: /^preact$/, replacement: resolveDependency('preact') }
            ]
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