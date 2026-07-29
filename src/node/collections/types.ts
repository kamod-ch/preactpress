import type { ZodType, output } from "zod";

/** Validated content entry produced by a collection loader. */
export interface CollectionEntry<TData = unknown> {
  /** Stable slug derived from the file path within the collection directory. */
  id: string;
  route: string;
  relativePath: string;
  file: string;
  url: string;
  /** Schema-validated frontmatter. */
  data: TData;
}

export type CollectionSortFn<TData = unknown> = (
  a: CollectionEntry<TData>,
  b: CollectionEntry<TData>,
) => number;

/** Built-in sort presets or a custom comparator. */
export type CollectionSortOption =
  | "route:asc"
  | "route:desc"
  | "date:asc"
  | "date:desc"
  | "order:asc"
  | "order:desc"
  | CollectionSortFn;

/** Field equality filter applied to validated entry data. */
export type CollectionFilter = Record<string, unknown>;

export interface LoadCollectionOptions<TData = unknown> {
  /** Include entries marked as draft or scheduled for a future publish date. */
  includeDrafts?: boolean;
  /** Sort preset or custom comparator. Defaults to the collection definition. */
  sort?: CollectionSortOption | CollectionSortFn<TData>;
  /** Keep entries whose `data` fields match every filter key. */
  filter?: CollectionFilter;
  /** Map validated entries to a custom shape for page data. */
  transform?: (entries: CollectionEntry<TData>[]) => unknown | Promise<unknown>;
}

export interface CollectionDefinition<TSchema extends ZodType = ZodType> {
  readonly __kind: "collection";
  /** Set automatically when the collection is registered. */
  name?: string;
  /** Directory relative to `srcDir` scanned for `.md` and `.mdx` files. */
  directory: string;
  /** Optional glob patterns relative to `srcDir` (alternative to `directory`). */
  patterns?: string[];
  schema: TSchema;
  /** Include draft entries when loading (overridden by per-call options). */
  includeDrafts?: boolean;
  sort?: CollectionSortOption | CollectionSortFn;
  /** Map frontmatter field names to collection names for reference resolution. */
  references?: Record<string, string>;
}

export interface CollectionLoader<T = unknown> {
  readonly __kind: "collection-loader";
  readonly collectionName: string;
  readonly options?: LoadCollectionOptions<T>;
}

export type InferCollectionData<T> = T extends CollectionDefinition<infer S> ? output<S> : never;

export type InferCollectionEntry<T> = CollectionEntry<InferCollectionData<T>>;

/** Resolved cross-collection reference attached to entry data at build time. */
export interface ResolvedReference {
  id: string;
  route: string;
  url: string;
  data: unknown;
}
