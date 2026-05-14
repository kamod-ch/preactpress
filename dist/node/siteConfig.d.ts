import type { Logger } from 'vite';
export interface NavItem {
    text: string;
    link: string;
}
export interface SidebarItem {
    text: string;
    link: string;
}
export interface SidebarGroup {
    text?: string;
    items: SidebarItem[];
}
export interface OutlineItem {
    id: string;
    text: string;
    level: number;
}
export interface ThemeConfig {
    nav?: NavItem[];
    sidebar?: SidebarGroup[];
    outline?: boolean;
    search?: boolean;
    footer?: string;
    editLink?: {
        pattern: string;
        text?: string;
    };
    lastUpdated?: boolean;
}
export interface MarkdownConfig {
    html?: boolean;
    linkify?: boolean;
    typographer?: boolean;
}
export interface SiteData {
    title: string;
    description: string;
    base: string;
    lang: string;
    url?: string;
}
export type HeadTag = ['meta', Record<string, string | boolean | undefined>] | ['link', Record<string, string | boolean | undefined>] | ['script', Record<string, string | boolean | undefined>, string?];
export interface BuildConfig {
    sitemap?: boolean;
    robots?: boolean;
}
export interface UserConfig {
    srcDir?: string;
    outDir?: string;
    cacheDir?: string;
    /** Path to Layout module (e.g. `./theme/Layout.tsx`) relative to `.preactpress` */
    theme?: string;
    site?: Partial<SiteData>;
    themeConfig?: ThemeConfig;
    markdown?: MarkdownConfig;
    head?: HeadTag[];
    transformHead?: (ctx: {
        route: string;
        title: string;
        description: string;
        site: SiteData;
    }) => HeadTag[] | Promise<HeadTag[]>;
    build?: BuildConfig;
    vite?: import('vite').UserConfig;
}
export interface SiteConfig {
    root: string;
    srcDir: string;
    configDir: string;
    outDir: string;
    cacheDir: string;
    theme: string;
    site: SiteData;
    themeConfig: ThemeConfig;
    markdown: Required<MarkdownConfig>;
    head: HeadTag[];
    transformHead?: UserConfig['transformHead'];
    build: Required<BuildConfig>;
    vite: import('vite').UserConfig;
    logger: Logger;
}
//# sourceMappingURL=siteConfig.d.ts.map