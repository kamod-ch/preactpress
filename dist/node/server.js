import path from 'node:path';
import { createServer as createViteServer, mergeConfig } from 'vite';
import preact from '@preact/preset-vite';
import { normalizeBase, resolveConfig } from './config.js';
import { PACKAGE_ROOT } from './packageRoot.js';
import { preactPressMdxPlugin } from './mdx.js';
import { preactPressPlugin } from './plugin.js';
import { resolvePreactEsm } from './resolveDeps.js';
const CLIENT_ALIAS = 'preactpress/app';
export function resolveClientEntry() {
    return path.join(PACKAGE_ROOT, 'src/client/entry-client.tsx');
}
export async function createServer(rootArg, serverOptions = {}) {
    const site = await resolveConfig(rootArg, 'serve', 'development');
    if (serverOptions.base)
        site.site.base = normalizeBase(serverOptions.base);
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
                { find: /^preact\/jsx-dev-runtime$/, replacement: resolvePreactEsm('preact/jsx-dev-runtime') },
                { find: /^preact\/jsx-runtime$/, replacement: resolvePreactEsm('preact/jsx-runtime') },
                { find: /^preact\/devtools$/, replacement: resolvePreactEsm('preact/devtools') },
                { find: /^preact\/hooks$/, replacement: resolvePreactEsm('preact/hooks') },
                { find: /^preact$/, replacement: resolvePreactEsm('preact') },
                {
                    find: /^preact-render-to-string$/,
                    replacement: resolvePreactEsm('preact-render-to-string')
                }
            ]
        },
        server: {
            host: true,
            fs: {
                allow: [site.root, PACKAGE_ROOT]
            },
            ...server
        },
        ssr: {
            noExternal: ['preact', 'preact-render-to-string']
        }
    };
    return createViteServer(mergeConfig(mergeConfig(internal, site.vite ?? {}), {
        root: site.srcDir,
        base: site.site.base
    }));
}
//# sourceMappingURL=server.js.map