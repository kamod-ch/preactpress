import path from 'node:path';
import { glob } from 'tinyglobby';
export const CONTENT_GLOBS = ['**/*.md', '**/*.mdx'];
export const CONTENT_EXTENSIONS = ['.mdx', '.md'];
export function mdFileToRoute(srcDir, file) {
    let rel = path.relative(srcDir, file).split(path.sep).join('/');
    const ext = CONTENT_EXTENSIONS.find((candidate) => rel.endsWith(candidate));
    if (!ext)
        return '/';
    rel = rel.slice(0, -ext.length);
    if (rel.endsWith('/index'))
        rel = rel.slice(0, -'/index'.length);
    if (rel === 'index' || rel === '')
        return '/';
    return '/' + rel;
}
export async function scanContentFiles(site) {
    const files = await glob([...CONTENT_GLOBS], {
        cwd: site.srcDir,
        absolute: true,
        ignore: ['**/node_modules/**', '**/.preactpress/**']
    });
    const routeToFile = new Map();
    for (const file of files.sort()) {
        const route = mdFileToRoute(site.srcDir, file);
        const kind = file.endsWith('.mdx') ? 'mdx' : 'markdown';
        const existing = routeToFile.get(route);
        if (existing) {
            throw new Error(`preactpress: route collision for ${route}: ${path.relative(site.srcDir, existing.file)} and ${path.relative(site.srcDir, file)}`);
        }
        routeToFile.set(route, { route, file, kind });
    }
    return [...routeToFile.values()];
}
export async function listMarkdownRoutes(site) {
    const files = await scanContentFiles(site);
    return files.map((f) => f.route).sort();
}
export function normalizeRoute(route) {
    const clean = route.split(/[?#]/, 1)[0] || '/';
    const prefixed = clean.startsWith('/') ? clean : `/${clean}`;
    return prefixed.replace(/\/$/, '') || '/';
}
export function fileHrefToRoute(href, fromRoute) {
    if (!href ||
        href.startsWith('#') ||
        /^(?:[a-z]+:)?\/\//i.test(href) ||
        /^(?:mailto|tel):/i.test(href)) {
        return undefined;
    }
    const [pathPart] = href.split(/[?#]/, 1);
    if (!/\.(?:mdx?|html)$/.test(pathPart))
        return undefined;
    const base = pathPart.startsWith('/')
        ? '/'
        : fromRoute === '/'
            ? '/'
            : `${fromRoute.replace(/\/[^/]*$/, '')}/`;
    const joined = path.posix.normalize(path.posix.join(base, pathPart));
    const withoutExt = joined.replace(/\.(?:mdx?|html)$/, '');
    const withoutIndex = withoutExt.replace(/\/index$/, '');
    return normalizeRoute(withoutIndex);
}
//# sourceMappingURL=content.js.map