import { jsx as _jsx } from "preact/jsx-runtime";
import { renderToString } from 'preact-render-to-string';
import { App } from './app.js';
import { pages } from 'virtual:preactpress-pages';
import { site } from 'virtual:preactpress-site';
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
    const title = page.title && page.title.length > 0
        ? `${page.title} | ${site.title}`
        : site.title;
    const description = (page.description && String(page.description)) || site.description;
    return { body, title, description };
}
//# sourceMappingURL=entry-ssr.js.map