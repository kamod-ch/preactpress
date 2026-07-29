/** Deterministic slug segments for stable routes across rebuilds. */
export function slugifySegment(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function joinRoute(baseRoute: string, ...segments: string[]): string {
  const base = baseRoute.replace(/\/$/, "") || "";
  const tail = segments.filter(Boolean).map(slugifySegment).join("/");
  return tail ? `${base}/${tail}` : base || "/";
}

export function symbolId(qualifiedName: string): string {
  return qualifiedName.replace(/[^a-zA-Z0-9._-]+/g, "_");
}
