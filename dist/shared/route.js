/** Normalize a path or route to a site route (no query/hash, leading slash, no trailing slash except `/`). */
export function normalizeRoute(route) {
    const clean = route.split(/[?#]/, 1)[0] || '/';
    const prefixed = clean.startsWith('/') ? clean : `/${clean}`;
    return prefixed.replace(/\/$/, '') || '/';
}
/** Map a request pathname to a site route using the configured base. */
export function routeFromPathname(pathname, base) {
    const basePath = base === '/' ? '' : base.replace(/\/$/, '');
    let p = pathname;
    if (basePath && p.startsWith(basePath))
        p = p.slice(basePath.length) || '/';
    return normalizeRoute(p);
}
//# sourceMappingURL=route.js.map