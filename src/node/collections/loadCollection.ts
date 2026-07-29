import type { CollectionLoader, LoadCollectionOptions } from "./types.js";

/** Declare a build-time query against a registered content collection. */
export function loadCollection<T = unknown>(
  collectionName: string,
  options?: LoadCollectionOptions<T>,
): CollectionLoader<T> {
  return {
    __kind: "collection-loader",
    collectionName,
    options,
  };
}

export function isCollectionLoader(value: unknown): value is CollectionLoader {
  return Boolean(
    value &&
    typeof value === "object" &&
    (value as CollectionLoader).__kind === "collection-loader",
  );
}
