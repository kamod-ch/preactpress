import type { ComponentType } from 'preact';
import type { OutlineItem, SiteData, ThemeConfig } from '../node/siteConfig.js';
interface BasePageView {
    title?: string;
    description?: string;
    meta: Record<string, unknown>;
    headings: OutlineItem[];
}
export interface HtmlPageView extends BasePageView {
    kind: 'markdown';
    html: string;
}
export interface MdxPageView extends BasePageView {
    kind: 'mdx';
    Component: ComponentType<{
        components?: Record<string, ComponentType<Record<string, unknown>>>;
    }>;
}
export type PageView = HtmlPageView | MdxPageView;
export interface LayoutProps {
    site: SiteData;
    themeConfig: ThemeConfig;
    routePath: string;
    page?: PageView;
}
export {};
//# sourceMappingURL=types.d.ts.map