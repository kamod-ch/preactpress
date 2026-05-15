export declare const META_DESCRIPTION_MAX = 155;
export interface PageMetaInput {
    title?: string;
    description?: string;
    kind?: 'markdown' | 'mdx';
    html?: string;
}
export interface SiteMetaInput {
    title: string;
    description: string;
}
export declare function excerptFromHtml(html: string, maxLen?: number): string;
export declare function resolvePageMeta(page: PageMetaInput | undefined, site: SiteMetaInput): {
    title: string;
    description: string;
};
//# sourceMappingURL=pageMeta.d.ts.map