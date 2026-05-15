import { type ContentFile } from './content.js';
import type { SiteConfig } from './siteConfig.js';
/** URL path segment for a tag (lowercase, hyphenated ASCII). */
export declare function slugifyTagSegment(tag: string): string;
export declare function tagIndexPageRoute(slug: string): string;
export type TagIndexBucket = {
    label: string;
    items: {
        route: string;
        title?: string;
    }[];
};
/**
 * Reads frontmatter from each content file and groups pages by tag slug.
 * Supports `tags: [a, b]` and singular `tag: a`.
 */
export declare function collectTagSlugMap(files: ContentFile[]): Map<string, TagIndexBucket>;
export declare function renderTagIndexHtml(slug: string, label: string, items: {
    route: string;
    title?: string;
}[]): string;
export declare function listTagIndexRoutes(site: Pick<SiteConfig, 'srcDir'>, fileRouteSet: ReadonlySet<string>): Promise<string[]>;
//# sourceMappingURL=tagIndex.d.ts.map