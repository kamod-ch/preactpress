import type { ComponentType } from "preact";
import type {
  OutlineItem,
  ResolvedI18n,
  ResolvedLocale,
  SiteData,
  ThemeConfig,
} from "../node/siteConfig.js";

interface BasePageView {
  title?: string;
  description?: string;
  tags?: string[];
  image?: string;
  pageType?: "website" | "article";
  meta: Record<string, unknown>;
  headings: OutlineItem[];
  relativePath?: string;
  lastUpdated?: string;
}

export interface HtmlPageView extends BasePageView {
  kind: "markdown";
  html: string;
}

export interface MdxPageView extends BasePageView {
  kind: "mdx";
  Component: ComponentType<{ components?: Record<string, ComponentType<Record<string, unknown>>> }>;
}

export type PageView = HtmlPageView | MdxPageView;

export interface LayoutProps {
  site: SiteData;
  themeConfig: ThemeConfig;
  routePath: string;
  page?: PageView;
  i18n?: ResolvedI18n;
  locale?: ResolvedLocale;
  locales?: ResolvedLocale[];
  localizeRoute?: (locale: ResolvedLocale) => string;
}
