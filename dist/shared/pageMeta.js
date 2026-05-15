export const META_DESCRIPTION_MAX = 155;
export function excerptFromHtml(html, maxLen = META_DESCRIPTION_MAX) {
    const text = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text)
        return '';
    if (text.length <= maxLen)
        return text;
    const cut = text.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(' ');
    const trimmed = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim();
    return `${trimmed}…`;
}
export function resolvePageMeta(page, site) {
    const title = page?.title && page.title.length > 0 ? `${page.title} | ${site.title}` : site.title;
    let description = (page?.description && String(page.description).trim()) || site.description.trim();
    if (!description && page?.kind === 'markdown' && page.html) {
        description = excerptFromHtml(page.html);
    }
    return { title, description };
}
//# sourceMappingURL=pageMeta.js.map