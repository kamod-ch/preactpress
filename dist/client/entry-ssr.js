import { jsx as _jsx } from "preact/jsx-runtime";
import { renderToString } from 'preact-render-to-string';
import { App } from './app.js';
import { pages } from 'virtual:preactpress-pages';
import { site } from 'virtual:preactpress-site';
import { resolvePageMeta } from '../shared/pageMeta.js';
export function render(routePath) {
    const body = renderToString(_jsx(App, { routePath: routePath }));
    const page = pages[routePath] ??
        pages['/404'] ?? {
        kind: 'markdown',
        html: '',
        title: 'Not found',
        description: site.description,
        meta: {},
        headings: []
    };
    const { title, description } = resolvePageMeta(page.kind === 'markdown'
        ? {
            title: page.title,
            description: page.description,
            kind: 'markdown',
            html: page.html
        }
        : {
            title: page.title,
            description: page.description,
            kind: 'mdx'
        }, site);
    return { body, title, description };
}
//# sourceMappingURL=entry-ssr.js.map