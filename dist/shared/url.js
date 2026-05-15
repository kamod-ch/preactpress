export function publicUrl(siteBase, file) {
    const b = siteBase === '/' ? '' : siteBase.replace(/\/$/, '');
    const f = file.startsWith('/') ? file : `/${file}`;
    return `${b}${f}`;
}
export function canonicalUrl(opts) {
    const path = publicUrl(opts.base, opts.route === '/' ? '/' : `${opts.route}/`);
    return opts.url ? `${opts.url}${path}` : path;
}
//# sourceMappingURL=url.js.map