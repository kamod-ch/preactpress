import fs from 'node:fs/promises';
import path from 'node:path';
import { readMarkdownFile, readMarkdownMetadata } from './markdown.js';
import { siteConfigToClientJson } from './config.js';
import { PREACTPRESS_THEME_BOOT_SCRIPT } from '../shared/theme.js';
import { CONTENT_EXTENSIONS, listMarkdownRoutes, mdFileToRoute, scanContentFiles } from './content.js';
const VIRTUAL_LAYOUT = '\0virtual:preactpress-layout';
const VIRTUAL_PAGES = '\0virtual:preactpress-pages';
const VIRTUAL_SITE = '\0virtual:preactpress-site';
export { listMarkdownRoutes, mdFileToRoute };
export function preactPressPlugin(site) {
    const routeToFile = new Map();
    let pagesModule = '';
    async function scan() {
        routeToFile.clear();
        for (const file of await scanContentFiles(site)) {
            routeToFile.set(file.route, file);
        }
    }
    async function buildPagesModule() {
        const routes = [...routeToFile.keys()].sort();
        const entries = {};
        const mdxImports = [];
        const mdxEntries = [];
        let mdxIndex = 0;
        for (const [route, file] of routeToFile) {
            const stats = await fs.stat(file.file);
            const relativePath = path.relative(site.srcDir, file.file).split(path.sep).join('/');
            const lastUpdated = stats.mtime.toISOString();
            if (file.kind === 'mdx') {
                const r = readMarkdownMetadata(file.file);
                const componentName = `MdxPage${mdxIndex}`;
                mdxIndex += 1;
                mdxImports.push(`import ${componentName} from ${JSON.stringify(file.file)};`);
                mdxEntries.push(`${JSON.stringify(route)}: { kind: "mdx", Component: ${componentName}, meta: ${JSON.stringify(r.meta)}, title: ${JSON.stringify(r.title)}, description: ${JSON.stringify(r.description)}, headings: ${JSON.stringify(r.headings)}, relativePath: ${JSON.stringify(relativePath)}, lastUpdated: ${JSON.stringify(lastUpdated)} }`);
                continue;
            }
            const r = await readMarkdownFile(file.file, {
                ...site.markdown,
                route,
                routes
            });
            entries[route] = {
                kind: 'markdown',
                meta: r.meta,
                html: r.html,
                title: r.title,
                description: r.description,
                headings: r.headings,
                relativePath,
                lastUpdated
            };
        }
        const markdownEntries = Object.entries(entries).map(([route, page]) => `${JSON.stringify(route)}: ${JSON.stringify(page)}`);
        return `${mdxImports.join('\n')}\nexport const routes = ${JSON.stringify(routes)};\nexport const pages = {\n${[
            ...markdownEntries,
            ...mdxEntries
        ].map((entry) => `  ${entry}`).join(',\n')}\n};\n`;
    }
    function invalidateVirtuals(server) {
        pagesModule = '';
        for (const id of [VIRTUAL_PAGES, VIRTUAL_SITE]) {
            const m = server.moduleGraph.getModuleById(id);
            if (m)
                server.moduleGraph.invalidateModule(m);
        }
    }
    return {
        name: 'preactpress',
        enforce: 'pre',
        transformIndexHtml(html) {
            if (!html.includes('</head>'))
                return html;
            const tag = `<script>${PREACTPRESS_THEME_BOOT_SCRIPT}</script>`;
            return html.replace('</head>', `    ${tag}\n  </head>`);
        },
        async buildStart() {
            await scan();
        },
        configureServer(server) {
            server.watcher.add(site.srcDir);
            server.watcher.on('all', async (_evt, file) => {
                if (typeof file === 'string' && CONTENT_EXTENSIONS.some((ext) => file.endsWith(ext))) {
                    await scan();
                    invalidateVirtuals(server);
                }
            });
        },
        resolveId(id) {
            if (id === 'virtual:preactpress-layout')
                return VIRTUAL_LAYOUT;
            if (id === 'virtual:preactpress-pages')
                return VIRTUAL_PAGES;
            if (id === 'virtual:preactpress-site')
                return VIRTUAL_SITE;
            return undefined;
        },
        async load(id) {
            if (id === VIRTUAL_LAYOUT) {
                return `export { default } from ${JSON.stringify(site.theme)};\n`;
            }
            if (id === VIRTUAL_SITE) {
                const data = JSON.parse(siteConfigToClientJson(site));
                return `export const site = ${JSON.stringify(data.site)};\nexport const themeConfig = ${JSON.stringify(data.themeConfig)};\n`;
            }
            if (id === VIRTUAL_PAGES) {
                if (!pagesModule)
                    pagesModule = await buildPagesModule();
                return pagesModule;
            }
            return undefined;
        }
    };
}
//# sourceMappingURL=plugin.js.map