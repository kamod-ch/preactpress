import type { Feature, Hero, PageAside, PageOutlineConfig } from "./pageChrome.js";

export const META_DESCRIPTION_MAX = 155;
export const PAGE_LAYOUTS = ["doc", "home", "page"] as const;
export type PageLayout = (typeof PAGE_LAYOUTS)[number];

export const DEFAULT_TITLE_TEMPLATE = ":title | :siteTitle";

/** Frontmatter and page metadata fields supported by PreactPress pages. */
export interface PageMetaInput {
  meta?: Record<string, unknown>;
  title?: string;
  titleTemplate?: string | false;
  description?: string;
  tags?: string[];
  image?: string;
  pageType?: "website" | "article";
  layout?: PageLayout;
  navbar?: boolean;
  sidebar?: boolean;
  aside?: PageAside;
  outline?: PageOutlineConfig;
  footer?: boolean;
  editLink?: boolean;
  lastUpdated?: boolean;
  pageClass?: string;
  isHome?: boolean;
  markdownStyles?: boolean;
  hero?: Hero;
  features?: Feature[];
  kind?: "markdown" | "mdx";
  html?: string;
}

/** Alias for {@link PageMetaInput} — use in themes, hooks, and custom frontmatter helpers. */
export type PageFrontmatter = PageMetaInput;

export interface SiteMetaInput {
  title: string;
  description: string;
  titleTemplate?: string | false;
}

export function formatTitleTemplate(
  template: string | false | undefined,
  params: { title?: string; siteTitle: string },
): string {
  if (template === false) {
    return params.title?.trim() || params.siteTitle;
  }
  const pattern = template?.trim() || DEFAULT_TITLE_TEMPLATE;
  if (!params.title?.trim()) return params.siteTitle;
  return pattern.replace(/:title/g, params.title.trim()).replace(/:siteTitle/g, params.siteTitle);
}

export function titleTemplateFromMeta(
  meta: Record<string, unknown> | undefined,
): string | false | undefined {
  const value = meta?.titleTemplate;
  if (value === false) return false;
  return typeof value === "string" ? value : undefined;
}

export function excerptFromHtml(html: string, maxLen = META_DESCRIPTION_MAX): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim();
  return `${trimmed}…`;
}

export function resolvePageMeta(
  page: PageMetaInput | undefined,
  site: SiteMetaInput,
): { title: string; description: string } {
  const { title, description } = resolvePageHeadMeta(page, site);
  return { title, description };
}

export function resolvePageHeadMeta(
  page: PageMetaInput | undefined,
  site: SiteMetaInput,
): {
  title: string;
  description: string;
  tags: string[];
  image?: string;
  pageType: "website" | "article";
} {
  const template = page?.titleTemplate ?? site.titleTemplate;
  const title = formatTitleTemplate(template, {
    title: page?.title,
    siteTitle: site.title,
  });

  let description =
    (page?.description && String(page.description).trim()) || site.description.trim();

  if (!description && page?.kind === "markdown" && page.html) {
    description = excerptFromHtml(page.html);
  }

  const tags = page?.tags?.filter((tag) => tag.trim()).map((tag) => tag.trim()) ?? [];
  const image = page?.image?.trim() || undefined;
  const pageType = page?.pageType === "article" ? "article" : "website";

  return { title, description, tags, image, pageType };
}

export function pageImageFromMeta(meta: Record<string, unknown>): string | undefined {
  const value = meta.ogImage ?? meta.image;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function pageTypeFromMeta(meta: Record<string, unknown>): "website" | "article" {
  return meta.type === "article" ? "article" : "website";
}

export function pageLayoutFromMeta(meta: Record<string, unknown> | undefined): PageLayout {
  const value = meta?.layout;
  return PAGE_LAYOUTS.includes(value as PageLayout) ? (value as PageLayout) : "doc";
}

export function isPageLayout(value: unknown): value is PageLayout {
  return PAGE_LAYOUTS.includes(value as PageLayout);
}

export function isDraftPage(meta: Record<string, unknown>): boolean {
  return meta.draft === true;
}

/** When frontmatter scopes a page to specific versions, return whether it belongs to `versionValue`. */
export function pageMatchesVersion(meta: Record<string, unknown>, versionValue: string): boolean {
  const scoped = meta.versions ?? meta.version;
  if (scoped === undefined) return true;
  if (typeof scoped === "string") return scoped === versionValue;
  if (Array.isArray(scoped)) return scoped.some((entry) => String(entry) === versionValue);
  return true;
}
