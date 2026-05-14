import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import './styles.css';
function withBase(base, link) {
    if (/^https?:\/\//.test(link))
        return link;
    const b = base === '/' ? '' : base.replace(/\/$/, '');
    const l = link.startsWith('/') ? link : `/${link}`;
    return `${b}${l}`;
}
function normalizeLink(link) {
    const clean = link.split(/[?#]/, 1)[0] || '/';
    const prefixed = clean.startsWith('/') ? clean : `/${clean}`;
    return prefixed.replace(/\/$/, '') || '/';
}
function isActive(routePath, link) {
    const route = normalizeLink(routePath);
    const target = normalizeLink(link);
    return route === target || (target !== '/' && route.startsWith(`${target}/`));
}
const Layout = ({ site, themeConfig, routePath, page }) => {
    const title = page?.title ? `${page.title} | ${site.title}` : site.title;
    const sidebarItems = (themeConfig.sidebar ?? []).flatMap((group) => group.items);
    const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link));
    const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined;
    const next = activeIndex >= 0 && activeIndex < sidebarItems.length - 1
        ? sidebarItems[activeIndex + 1]
        : undefined;
    const showOutline = themeConfig.outline !== false && Boolean(page?.headings.length);
    return (_jsxs("div", { class: "pp-layout", children: [_jsx("a", { class: "pp-skip-link", href: "#content", children: "Skip to content" }), _jsx("header", { class: "pp-nav", children: _jsxs("div", { class: "pp-nav-inner", children: [_jsx("a", { class: "pp-title", href: withBase(site.base, '/'), children: site.title }), _jsx("nav", { class: "pp-nav-links", children: (themeConfig.nav ?? []).map((item) => {
                                const active = isActive(routePath, item.link);
                                return (_jsx("a", { class: active ? 'active' : '', href: withBase(site.base, item.link), "aria-current": active ? 'page' : undefined, children: item.text }, item.link));
                            }) })] }) }), _jsxs("div", { class: "pp-body", children: [_jsx("aside", { class: "pp-sidebar", "aria-label": "Site navigation", children: _jsxs("details", { class: "pp-sidebar-panel", open: true, children: [_jsx("summary", { children: "Navigation" }), (themeConfig.sidebar ?? []).map((group, gi) => (_jsxs("div", { class: "pp-sidebar-group", children: [group.text ? (_jsx("div", { class: "pp-sidebar-heading", children: group.text })) : null, _jsx("ul", { children: group.items.map((it) => {
                                                const active = isActive(routePath, it.link);
                                                return (_jsx("li", { children: _jsx("a", { class: active ? 'active' : '', href: withBase(site.base, it.link), "aria-current": active ? 'page' : undefined, children: it.text }) }, it.link));
                                            }) })] }, gi)))] }) }), _jsx("main", { id: "content", class: "pp-main", children: _jsxs("article", { class: "pp-doc", children: [_jsx("h1", { class: "pp-doc-title", children: page?.title ?? title }), page?.description ? (_jsx("p", { class: "pp-doc-lead", children: page.description })) : null, _jsx("div", { class: "pp-doc-content", dangerouslySetInnerHTML: { __html: page?.html ?? '' } }), previous || next ? (_jsxs("nav", { class: "pp-pager", "aria-label": "Page navigation", children: [previous ? (_jsxs("a", { class: "pp-pager-link previous", href: withBase(site.base, previous.link), children: [_jsx("span", { children: "Previous" }), previous.text] })) : (_jsx("span", {})), next ? (_jsxs("a", { class: "pp-pager-link next", href: withBase(site.base, next.link), children: [_jsx("span", { children: "Next" }), next.text] })) : null] })) : null] }) }), showOutline ? (_jsxs("aside", { class: "pp-outline", "aria-label": "On this page", children: [_jsx("div", { class: "pp-outline-heading", children: "On this page" }), _jsx("nav", { children: page?.headings.map((heading) => (_jsx("a", { class: `level-${heading.level}`, href: `#${heading.id}`, children: heading.text }, heading.id))) })] })) : null] })] }));
};
export default Layout;
//# sourceMappingURL=Layout.js.map