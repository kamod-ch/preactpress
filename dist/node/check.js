import fs from 'node:fs/promises';
import path from 'node:path';
import c from 'picocolors';
import { resolveConfig } from './config.js';
import { fileHrefToRoute, normalizeRoute, scanContentFiles } from './content.js';
const MARKDOWN_LINK_RE = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_HREF_RE = /\bhref=["']([^"']+)["']/g;
export async function check(root) {
    const site = await resolveConfig(root, 'serve', 'development');
    const files = await scanContentFiles(site);
    const routes = files.map((file) => file.route).sort();
    const routeSet = new Set(routes);
    const issues = [];
    if (!routeSet.has('/')) {
        issues.push({
            level: 'error',
            message: 'missing root page: add index.md or index.mdx'
        });
    }
    checkConfiguredLinks(site, routeSet, issues);
    for (const file of files) {
        const raw = await fs.readFile(file.file, 'utf8');
        for (const href of extractLinks(raw)) {
            const target = fileHrefToRoute(href, file.route);
            if (!target)
                continue;
            if (!routeSet.has(target)) {
                issues.push({
                    level: 'error',
                    message: `${path.relative(site.srcDir, file.file)} links to missing page ${href} (${target})`
                });
            }
        }
    }
    return { issues, routes };
}
export function printCheckResult(result) {
    console.log(c.bold(`PreactPress check: ${result.routes.length} route(s)`));
    for (const route of result.routes)
        console.log(`  ${c.dim('-')} ${route}`);
    if (result.issues.length === 0) {
        console.log(c.green('No issues found.'));
        return;
    }
    for (const issue of result.issues) {
        const label = issue.level === 'error' ? c.red('error') : c.yellow('warning');
        console.log(`${label}: ${issue.message}`);
    }
}
function checkConfiguredLinks(site, routes, issues) {
    for (const item of site.themeConfig.nav ?? []) {
        checkRouteLink(`nav item "${item.text}"`, item.link, routes, issues);
    }
    for (const group of site.themeConfig.sidebar ?? []) {
        for (const item of group.items) {
            checkRouteLink(`sidebar item "${item.text}"`, item.link, routes, issues);
        }
    }
}
function checkRouteLink(label, link, routes, issues) {
    if (/^(?:[a-z]+:)?\/\//i.test(link) || /^(?:mailto|tel):/i.test(link))
        return;
    const route = normalizeRoute(link);
    if (!routes.has(route)) {
        issues.push({
            level: 'error',
            message: `${label} points to missing route ${link} (${route})`
        });
    }
}
function extractLinks(raw) {
    const links = [];
    for (const match of raw.matchAll(MARKDOWN_LINK_RE))
        links.push(match[1]);
    for (const match of raw.matchAll(HTML_HREF_RE))
        links.push(match[1]);
    return links;
}
//# sourceMappingURL=check.js.map