import { useEffect } from 'preact/hooks';
import { resolvePageMeta } from '../shared/pageMeta.js';
import { canonicalUrl } from '../shared/url.js';
function upsertMeta(selector, key, content) {
    if (!content)
        return;
    let el = document.head.querySelector(`meta[${selector}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(selector, key);
        document.head.appendChild(el);
    }
    el.content = content;
}
function upsertCanonical(href) {
    if (!href)
        return;
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.rel = 'canonical';
        document.head.appendChild(el);
    }
    el.href = href;
}
export function usePageHead(opts) {
    const { site, route, page } = opts;
    useEffect(() => {
        const { title, description } = resolvePageMeta(page?.kind === 'markdown'
            ? {
                title: page.title,
                description: page.description,
                kind: 'markdown',
                html: page.html
            }
            : page
                ? {
                    title: page.title,
                    description: page.description,
                    kind: page.kind
                }
                : undefined, site);
        document.title = title;
        upsertMeta('name', 'description', description);
        upsertMeta('property', 'og:title', title);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:type', 'website');
        upsertMeta('name', 'twitter:card', 'summary');
        upsertMeta('name', 'twitter:title', title);
        upsertMeta('name', 'twitter:description', description);
        const canonical = canonicalUrl({ url: site.url, base: site.base, route });
        upsertMeta('property', 'og:url', canonical);
        upsertCanonical(canonical);
        if (document.documentElement.lang !== site.lang) {
            document.documentElement.lang = site.lang;
        }
    }, [site, route, page]);
}
//# sourceMappingURL=usePageHead.js.map