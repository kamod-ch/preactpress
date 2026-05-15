/** Normalize a path or route to a site route (no query/hash, leading slash, no trailing slash except `/`). */
export declare function normalizeRoute(route: string): string;
/** Map a request pathname to a site route using the configured base. */
export declare function routeFromPathname(pathname: string, base: string): string;
//# sourceMappingURL=route.d.ts.map