import path from 'node:path';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { build as viteBuild, mergeConfig } from 'vite';
import preact from '@preact/preset-vite';
import { normalizeBase, resolveConfigForBuild } from './config.js';
import { PACKAGE_ROOT } from './packageRoot.js';
import { preactPressMdxPlugin } from './mdx.js';
import { listMarkdownRoutes, preactPressPlugin } from './plugin.js';
import { resolveDependency } from './resolveDeps.js';
import { PREACTPRESS_THEME_BOOT_SCRIPT } from '../shared/theme.js';
const CLIENT_ALIAS = 'preactpress/app';
function clientEntry() {
    return path.join(PACKAGE_ROOT, 'src/client/entry-client.tsx');
}
function ssrEntry() {
    return path.join(PACKAGE_ROOT, 'src/client/entry-ssr.tsx');
}
export function publicUrl(siteBase, file) {
    const b = siteBase === '/' ? '' : siteBase.replace(/\/$/, '');
    const f = file.startsWith('/') ? file : `/${file}`;
    return `${b}${f}`;
}
function escapeHtml(s) {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}
function escapeAttr(s) {
    return escapeHtml(s);
}
async function readManifest(outDir) {
    const candidates = [
        path.join(outDir, 'manifest.json'),
        path.join(outDir, '.vite', 'manifest.json')
    ];
    for (const p of candidates) {
        try {
            const raw = await fs.readFile(p, 'utf8');
            return JSON.parse(raw);
        }
        catch {
            /* try next */
        }
    }
    throw new Error('preactpress: could not read Vite client manifest');
}
export function pickMainEntry(manifest) {
    const main = manifest['main'];
    if (main?.file?.endsWith('.js')) {
        return { file: main.file, css: main.css ?? [] };
    }
    for (const chunk of Object.values(manifest)) {
        if (chunk.isEntry && chunk.file?.endsWith('.js')) {
            return { file: chunk.file, css: chunk.css ?? [] };
        }
    }
    throw new Error('preactpress: no entry chunk in manifest');
}
export function routeToOutPath(route) {
    if (route === '/')
        return 'index.html';
    const clean = route.replace(/^\//, '');
    return path.join(clean, 'index.html');
}
export async function build(root, opts = {}) {
    const site = await resolveConfigForBuild(root);
    if (opts.base)
        site.site.base = normalizeBase(opts.base);
    const clientOut = path.join(site.cacheDir, 'pp-client');
    const ssrOut = path.join(site.cacheDir, 'pp-ssr');
    await fs.rm(site.outDir, { recursive: true, force: true });
    await fs.mkdir(site.outDir, { recursive: true });
    await fs.mkdir(clientOut, { recursive: true });
    await fs.mkdir(ssrOut, { recursive: true });
    const shared = {
        root: site.srcDir,
        base: site.site.base,
        customLogger: site.logger,
        plugins: [preactPressMdxPlugin(), preact(), preactPressPlugin(site)],
        resolve: {
            alias: [
                { find: CLIENT_ALIAS, replacement: clientEntry() },
                { find: /^preact\/jsx-dev-runtime$/, replacement: resolveDependency('preact/jsx-dev-runtime') },
                { find: /^preact\/jsx-runtime$/, replacement: resolveDependency('preact/jsx-runtime') },
                { find: /^preact\/devtools$/, replacement: resolveDependency('preact/devtools') },
                { find: /^preact\/hooks$/, replacement: resolveDependency('preact/hooks') },
                { find: /^preact$/, replacement: resolveDependency('preact') }
            ]
        }
    };
    await viteBuild(mergeConfig(mergeConfig(shared, site.vite ?? {}), {
        root: site.srcDir,
        base: site.site.base,
        build: {
            manifest: true,
            outDir: clientOut,
            emptyOutDir: true,
            rollupOptions: {
                input: { main: CLIENT_ALIAS }
            }
        }
    }));
    await viteBuild(mergeConfig(mergeConfig(shared, site.vite ?? {}), {
        root: site.srcDir,
        base: site.site.base,
        ssr: {
            /** Bundle with app Preact so SSR does not load a second `preact` via `preact-render-to-string`. */
            noExternal: ['preact-render-to-string']
        },
        build: {
            ssr: true,
            outDir: ssrOut,
            emptyOutDir: true,
            rollupOptions: {
                input: ssrEntry(),
                output: {
                    format: 'esm',
                    entryFileNames: 'entry-ssr.js'
                }
            },
            copyPublicDir: false
        }
    }));
    const manifest = await readManifest(clientOut);
    const main = pickMainEntry(manifest);
    const ssrAbs = path.join(ssrOut, 'entry-ssr.js');
    const mod = (await import(pathToFileURL(ssrAbs).href));
    await copyClientAssets(clientOut, site.outDir);
    const routes = await listMarkdownRoutes(site);
    if (!routes.includes('/')) {
        throw new Error('preactpress: add an index.md or index.mdx at the site root');
    }
    for (const route of routes) {
        const { body, title, description } = mod.render(route);
        const html = await pageHtml({
            site,
            body,
            title,
            description,
            route,
            mainJs: main.file,
            mainCss: main.css
        });
        const outFile = path.join(site.outDir, routeToOutPath(route));
        await fs.mkdir(path.dirname(outFile), { recursive: true });
        await fs.writeFile(outFile, html, 'utf8');
    }
    const notFound = mod.render('/404');
    await fs.writeFile(path.join(site.outDir, '404.html'), await pageHtml({
        site,
        body: notFound.body,
        title: notFound.title,
        description: notFound.description,
        route: '/404',
        mainJs: main.file,
        mainCss: main.css
    }), 'utf8');
    await writeSearchIndex(site, routes);
    if (site.site.url && site.build.sitemap)
        await writeSitemap(site, routes);
    if (site.site.url && site.build.robots)
        await writeRobots(site);
}
async function copyClientAssets(fromDir, toDir) {
    const entries = await fs.readdir(fromDir, { withFileTypes: true });
    for (const ent of entries) {
        if (ent.name === '.vite')
            continue;
        const src = path.join(fromDir, ent.name);
        const dest = path.join(toDir, ent.name);
        await fs.cp(src, dest, { recursive: true });
    }
}
async function pageHtml(opts) {
    const { site, body, title, description, route, mainJs, mainCss } = opts;
    const base = site.site.base;
    const cssTags = mainCss
        .map((c) => {
        const href = publicUrl(base, `${c}`);
        return `<link rel="stylesheet" crossorigin href="${escapeHtml(href)}">`;
    })
        .join('\n    ');
    const scriptSrc = escapeHtml(publicUrl(base, mainJs));
    const routeJson = JSON.stringify(route);
    const canonical = absoluteUrl(site, route);
    const defaultHead = [
        ['meta', { name: 'description', content: description }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:url', content: canonical }],
        ['meta', { name: 'twitter:card', content: 'summary' }],
        ['meta', { name: 'twitter:title', content: title }],
        ['meta', { name: 'twitter:description', content: description }],
        ['link', { rel: 'canonical', href: canonical }]
    ];
    const transformed = site.transformHead
        ? await site.transformHead({ route, title, description, site: site.site })
        : [];
    const headTags = [...defaultHead, ...site.head, ...transformed]
        .filter((tag) => tag[1] && !Object.values(tag[1]).every((value) => value == null || value === false))
        .map(renderHeadTag)
        .join('\n    ');
    return `<!DOCTYPE html>
<html lang="${escapeAttr(site.site.lang)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <script>${PREACTPRESS_THEME_BOOT_SCRIPT}</script>
    ${headTags}
    ${cssTags}
  </head>
  <body>
    <script>window.__PREACTPRESS_ROUTE__=${routeJson}</script>
    <div id="app">${body}</div>
    <script type="module" crossorigin src="${scriptSrc}"></script>
  </body>
</html>
`;
}
function renderHeadTag(tag) {
    const [name, attrs, content] = tag;
    const renderedAttrs = Object.entries(attrs)
        .filter(([, value]) => value != null && value !== false)
        .map(([key, value]) => (value === true ? key : `${key}="${escapeAttr(String(value))}"`))
        .join(' ');
    if (name === 'script') {
        return `<script${renderedAttrs ? ` ${renderedAttrs}` : ''}>${content ?? ''}</script>`;
    }
    return `<${name}${renderedAttrs ? ` ${renderedAttrs}` : ''}>`;
}
function absoluteUrl(site, route) {
    const path = publicUrl(site.site.base, route === '/' ? '/' : `${route}/`);
    return site.site.url ? `${site.site.url}${path}` : path;
}
async function writeSitemap(site, routes) {
    const urls = routes
        .map((route) => `  <url><loc>${escapeHtml(absoluteUrl(site, route))}</loc></url>`)
        .join('\n');
    await fs.writeFile(path.join(site.outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
}
async function writeRobots(site) {
    await fs.writeFile(path.join(site.outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl(site, '/sitemap.xml').replace(/\/$/, '')}\n`, 'utf8');
}
async function writeSearchIndex(site, routes) {
    const entries = routes.map((route) => ({ route }));
    await fs.writeFile(path.join(site.outDir, 'preactpress-search.json'), JSON.stringify(entries, null, 2), 'utf8');
}
//# sourceMappingURL=build.js.map