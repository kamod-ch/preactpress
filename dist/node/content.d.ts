import type { SiteConfig } from './siteConfig.js';
export declare const CONTENT_GLOBS: readonly ["**/*.md", "**/*.mdx"];
export declare const CONTENT_EXTENSIONS: readonly [".mdx", ".md"];
export type ContentKind = 'markdown' | 'mdx';
export interface ContentFile {
    route: string;
    file: string;
    kind: ContentKind;
}
export declare function mdFileToRoute(srcDir: string, file: string): string;
export declare function scanContentFiles(site: Pick<SiteConfig, 'srcDir'>): Promise<ContentFile[]>;
export declare function listMarkdownRoutes(site: Pick<SiteConfig, 'srcDir'>): Promise<string[]>;
export declare function normalizeRoute(route: string): string;
export declare function fileHrefToRoute(href: string, fromRoute: string): string | undefined;
//# sourceMappingURL=content.d.ts.map