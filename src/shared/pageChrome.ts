import { pageLayoutFromMeta, type PageLayout } from "./pageMeta.js";

export type PageAside = boolean | "left";
export type PageOutlineConfig = number | [number, number] | "deep" | false;
export type PageOutlineLevels = [number, number] | false;

export type ThemeableImage =
  | string
  | { src: string; alt?: string }
  | { light: string; dark: string; alt?: string };

export interface HeroAction {
  theme: "brand" | "alt";
  text: string;
  link: string;
  target?: string;
  rel?: string;
}

export interface Hero {
  name?: string;
  text?: string;
  tagline?: string;
  image?: ThemeableImage;
  actions: HeroAction[];
}

export type FeatureIcon =
  | string
  | { src: string; alt?: string; width?: string; height?: string }
  | { light: string; dark: string; alt?: string; width?: string; height?: string };

export interface Feature {
  icon?: FeatureIcon;
  title: string;
  details: string;
  link?: string;
  linkText?: string;
  rel?: string;
  target?: string;
}

export interface PageChromeThemeConfig {
  outline?: boolean | PageOutlineConfig;
  footer?: string;
  editLink?: unknown;
  lastUpdated?: boolean;
}

export interface ResolvedPageChrome {
  layout: PageLayout;
  isHome: boolean;
  showNavbar: boolean;
  showSidebar: boolean;
  aside: PageAside;
  showAside: boolean;
  outlineLevels: PageOutlineLevels;
  showPager: boolean;
  showFooter: boolean;
  showEditLink: boolean;
  showLastUpdated: boolean;
  pageClass?: string;
  markdownStyles: boolean;
  hero?: Hero;
  features: Feature[];
}

export interface OutlineHeading {
  id: string;
  text: string;
  level: number;
}

export function resolvePageChrome(
  meta: Record<string, unknown> | undefined,
  themeConfig: PageChromeThemeConfig = {},
): ResolvedPageChrome {
  const layout = pageLayoutFromMeta(meta);
  const isHome = layout === "home" || meta?.isHome === true;
  const aside = resolveAside(meta?.aside, layout === "doc");
  const outlineLevels = resolveOutlineLevels(meta?.outline, themeConfig.outline);
  const showAside = aside !== false && outlineLevels !== false;

  return {
    layout,
    isHome,
    showNavbar: resolveBoolean(meta?.navbar, true),
    showSidebar: resolveBoolean(meta?.sidebar, layout === "doc"),
    aside,
    showAside,
    outlineLevels,
    showPager: layout === "doc",
    showFooter: Boolean(themeConfig.footer) && resolveBoolean(meta?.footer, true),
    showEditLink: Boolean(themeConfig.editLink) && resolveBoolean(meta?.editLink, true),
    showLastUpdated: Boolean(themeConfig.lastUpdated) && resolveBoolean(meta?.lastUpdated, true),
    pageClass: resolveString(meta?.pageClass),
    markdownStyles: layout !== "page" && meta?.markdownStyles !== false,
    hero: parseHero(meta?.hero),
    features: parseFeatures(meta?.features),
  };
}

export function filterHeadingsForOutline<T extends OutlineHeading>(
  headings: T[],
  levels: PageOutlineLevels,
): T[] {
  if (levels === false) return [];
  const [min, max] = levels;
  return headings.filter((heading) => heading.level >= min && heading.level <= max);
}

export function parseHero(value: unknown): Hero | undefined {
  if (!isRecord(value)) return undefined;

  const name = resolveString(value.name);
  const text = resolveString(value.text);
  const tagline = resolveString(value.tagline);
  const image = parseThemeableImage(value.image);
  const actions = Array.isArray(value.actions)
    ? value.actions.map(parseHeroAction).filter((action): action is HeroAction => Boolean(action))
    : [];

  if (!name && !text && !tagline && !image && actions.length === 0) return undefined;

  return { name, text, tagline, image, actions };
}

export function parseFeatures(value: unknown): Feature[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseFeature).filter((feature): feature is Feature => Boolean(feature));
}

function parseHeroAction(value: unknown): HeroAction | undefined {
  if (!isRecord(value)) return undefined;
  const text = resolveString(value.text);
  const link = resolveString(value.link);
  if (!text || !link) return undefined;

  return {
    theme: value.theme === "alt" ? "alt" : "brand",
    text,
    link,
    target: resolveString(value.target),
    rel: resolveString(value.rel),
  };
}

function parseFeature(value: unknown): Feature | undefined {
  if (!isRecord(value)) return undefined;
  const title = resolveString(value.title);
  const details = resolveString(value.details);
  if (!title || !details) return undefined;

  return {
    icon: parseFeatureIcon(value.icon),
    title,
    details,
    link: resolveString(value.link),
    linkText: resolveString(value.linkText),
    rel: resolveString(value.rel),
    target: resolveString(value.target),
  };
}

function parseThemeableImage(value: unknown): ThemeableImage | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!isRecord(value)) return undefined;

  const src = resolveString(value.src);
  if (src) return { src, alt: resolveString(value.alt) };

  const light = resolveString(value.light);
  const dark = resolveString(value.dark);
  if (light && dark) return { light, dark, alt: resolveString(value.alt) };

  return undefined;
}

function parseFeatureIcon(value: unknown): FeatureIcon | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!isRecord(value)) return undefined;

  const width = resolveString(value.width);
  const height = resolveString(value.height);
  const src = resolveString(value.src);
  if (src) return { src, alt: resolveString(value.alt), width, height };

  const light = resolveString(value.light);
  const dark = resolveString(value.dark);
  if (light && dark) {
    return { light, dark, alt: resolveString(value.alt), width, height };
  }

  return undefined;
}

function resolveAside(value: unknown, defaultValue: boolean): PageAside {
  if (value === "left") return "left";
  if (typeof value === "boolean") return value;
  return defaultValue;
}

function resolveOutlineLevels(
  pageValue: unknown,
  siteValue: PageChromeThemeConfig["outline"],
): PageOutlineLevels {
  const pageLevels = parseOutlineLevels(pageValue);
  if (pageLevels !== undefined) return pageLevels;

  if (siteValue === false) return false;
  return parseOutlineLevels(siteValue) ?? [2, 3];
}

function parseOutlineLevels(value: unknown): PageOutlineLevels | undefined {
  if (value === false) return false;
  if (value === "deep") return [2, 6];
  if (typeof value === "number") return normalizeOutlineRange(value, value);
  if (Array.isArray(value) && value.length === 2) {
    const [min, max] = value;
    if (typeof min === "number" && typeof max === "number") {
      return normalizeOutlineRange(min, max);
    }
  }
  return undefined;
}

function normalizeOutlineRange(min: number, max: number): PageOutlineLevels | undefined {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  const start = Math.max(1, Math.min(6, Math.trunc(min)));
  const end = Math.max(1, Math.min(6, Math.trunc(max)));
  return start <= end ? [start, end] : [end, start];
}

function resolveBoolean(value: unknown, defaultValue: boolean): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

function resolveString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
