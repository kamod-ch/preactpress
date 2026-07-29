import type { CollectionEntry, CollectionSortFn, CollectionSortOption } from "./types.js";

function getDateValue(entry: CollectionEntry): number {
  const data = entry.data as Record<string, unknown>;
  const date = data.date ?? data.publishedAt ?? data.publishDate;
  if (date instanceof Date) return date.getTime();
  if (typeof date === "string") {
    const parsed = Date.parse(date);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function getOrderValue(entry: CollectionEntry): number {
  const data = entry.data as Record<string, unknown>;
  return typeof data.order === "number" ? data.order : 0;
}

/** Resolve a built-in sort preset or pass through a custom comparator. */
export function resolveSortComparator(
  option: CollectionSortOption | CollectionSortFn,
): CollectionSortFn {
  if (typeof option === "function") return option;

  switch (option) {
    case "route:desc":
      return (a, b) => b.route.localeCompare(a.route);
    case "date:asc":
      return (a, b) => getDateValue(a) - getDateValue(b) || a.route.localeCompare(b.route);
    case "date:desc":
      return (a, b) => getDateValue(b) - getDateValue(a) || a.route.localeCompare(b.route);
    case "order:asc":
      return (a, b) => getOrderValue(a) - getOrderValue(b) || a.route.localeCompare(b.route);
    case "order:desc":
      return (a, b) => getOrderValue(b) - getOrderValue(a) || a.route.localeCompare(b.route);
    case "route:asc":
    default:
      return (a, b) => a.route.localeCompare(b.route);
  }
}
