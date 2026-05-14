import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import './styles.css';
function withBase(base, link) {
    if (/^https?:\/\//.test(link))
        return link;
    const b = base === '/' ? '' : base.replace(/\/$/, '');
    const l = link.startsWith('/') ? link : `/${link}`;
    return `${b}${l}`;
}
const Layout = ({ site, themeConfig, routePath, page }) => {
    const title = page?.title ? `${page.title} | ${site.title}` : site.title;
    return (_jsxs("div", { class: "pp-layout", children: [_jsx("header", { class: "pp-nav", children: _jsxs("div", { class: "pp-nav-inner", children: [_jsx("a", { class: "pp-title", href: withBase(site.base, '/'), children: site.title }), _jsx("nav", { class: "pp-nav-links", children: (themeConfig.nav ?? []).map((item) => (_jsx("a", { href: withBase(site.base, item.link), children: item.text }, item.link))) })] }) }), _jsxs("div", { class: "pp-body", children: [_jsx("aside", { class: "pp-sidebar", children: (themeConfig.sidebar ?? []).map((group, gi) => (_jsxs("div", { class: "pp-sidebar-group", children: [group.text ? (_jsx("div", { class: "pp-sidebar-heading", children: group.text })) : null, _jsx("ul", { children: group.items.map((it) => {
                                        const active = routePath === it.link ||
                                            (it.link !== '/' && routePath.startsWith(it.link));
                                        return (_jsx("li", { children: _jsx("a", { class: active ? 'active' : '', href: withBase(site.base, it.link), children: it.text }) }, it.link));
                                    }) })] }, gi))) }), _jsx("main", { class: "pp-main", children: _jsxs("article", { class: "pp-doc", children: [_jsx("h1", { class: "pp-doc-title", children: page?.title ?? title }), page?.description ? (_jsx("p", { class: "pp-doc-lead", children: page.description })) : null, _jsx("div", { class: "pp-doc-content", dangerouslySetInnerHTML: { __html: page?.html ?? '' } })] }) })] })] }));
};
export default Layout;
//# sourceMappingURL=Layout.js.map