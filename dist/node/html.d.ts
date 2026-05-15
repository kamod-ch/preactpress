import type { HeadTag, SiteConfig } from './siteConfig.js';
export { publicUrl } from '../shared/url.js';
export declare function escapeHtml(s: string): string;
export declare function escapeAttr(s: string): string;
export declare function absoluteUrl(site: SiteConfig, route: string): string;
export declare function renderHeadTag(tag: HeadTag): string;
export declare function buildDefaultHeadTags(opts: {
    site: SiteConfig;
    route: string;
    title: string;
    description: string;
}): HeadTag[];
export declare function renderStylesheetLinks(hrefs: string[]): string;
export declare function collectHeadTags(opts: {
    site: SiteConfig;
    route: string;
    title: string;
    description: string;
}): Promise<string>;
export declare function pageHtml(opts: {
    site: SiteConfig;
    body: string;
    title: string;
    description: string;
    route: string;
    mainJs: string;
    mainCss: string[];
}): Promise<string>;
/** Patch a Vite-transformed dev index.html with per-route SEO and SSR body. */
export declare function injectDevPageDocument(html: string, opts: {
    site: SiteConfig;
    body: string;
    title: string;
    description: string;
    route: string;
    /** Dev-only stylesheet URLs from the Vite client module graph (avoids FOUC). */
    devStylesheets?: string[];
}): Promise<string>;
//# sourceMappingURL=html.d.ts.map