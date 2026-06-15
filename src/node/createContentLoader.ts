export interface ContentItem {
  route: string;
  relativePath: string;
  file: string;
  frontmatter: Record<string, unknown>;
  title?: string;
  description?: string;
  url: string;
}

export interface ContentLoader<T = ContentItem[]> {
  readonly __kind: "content-loader";
  readonly patterns: string[];
  readonly transform?: (items: ContentItem[]) => T | Promise<T>;
}

export function createContentLoader<T = ContentItem[]>(
  patterns: string | string[],
  options?: {
    transform?: (items: ContentItem[]) => T | Promise<T>;
  },
): ContentLoader<T> {
  return {
    __kind: "content-loader",
    patterns: Array.isArray(patterns) ? patterns : [patterns],
    transform: options?.transform,
  };
}

export function isContentLoader(value: unknown): value is ContentLoader {
  return Boolean(
    value && typeof value === "object" && (value as ContentLoader).__kind === "content-loader",
  );
}
