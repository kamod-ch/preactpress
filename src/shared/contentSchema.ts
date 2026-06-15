/** Author metadata for articles, magazines, and blogs. */
export interface Author {
  name: string;
  slug?: string;
  avatar?: string;
}

/** Category or rubric metadata for editorial content. */
export interface ContentCategory {
  name: string;
  slug?: string;
}

/** Common article frontmatter fields beyond built-in page metadata. */
export interface ArticleFrontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  author?: string | Author;
  category?: string | ContentCategory;
  readTime?: string;
  draft?: boolean;
}

/** Normalized article record produced from content loaders or hooks. */
export interface ArticlePost {
  title: string;
  route: string;
  url: string;
  description?: string;
  tags?: string[];
  author?: Author;
  category?: ContentCategory;
  readTime?: string;
}

export function parseAuthor(value: unknown): Author | undefined {
  if (typeof value === "string" && value.trim()) {
    return { name: value.trim() };
  }
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) return undefined;
  const slug =
    typeof record.slug === "string" && record.slug.trim() ? record.slug.trim() : undefined;
  const avatar =
    typeof record.avatar === "string" && record.avatar.trim() ? record.avatar.trim() : undefined;
  return { name, slug, avatar };
}

export function parseCategory(value: unknown): ContentCategory | undefined {
  if (typeof value === "string" && value.trim()) {
    return { name: value.trim() };
  }
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) return undefined;
  const slug =
    typeof record.slug === "string" && record.slug.trim() ? record.slug.trim() : undefined;
  return { name, slug };
}

export function articleFromFrontmatter(opts: {
  route: string;
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  frontmatter: Record<string, unknown>;
}): ArticlePost {
  const fm = opts.frontmatter as ArticleFrontmatter;
  const title = (opts.title ?? fm.title ?? "Untitled").trim();
  const description = (opts.description ?? fm.description)?.trim() || undefined;
  const tags = (opts.tags ?? fm.tags)?.filter((tag) => tag.trim()).map((tag) => tag.trim());
  return {
    title,
    route: opts.route,
    url: opts.url,
    description,
    tags,
    author: parseAuthor(fm.author),
    category: parseCategory(fm.category) ?? (tags?.[0] ? { name: tags[0] } : undefined),
    readTime:
      typeof fm.readTime === "string" && fm.readTime.trim() ? fm.readTime.trim() : undefined,
  };
}
