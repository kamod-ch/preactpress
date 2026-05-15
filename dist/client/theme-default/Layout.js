import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect, useMemo, useState } from 'preact/hooks';
import Logo from './Logo.js';
import ThemeToggle from './ThemeToggle.js';
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
function childText(children) {
    if (children == null || typeof children === 'boolean')
        return '';
    if (typeof children === 'string' || typeof children === 'number')
        return String(children);
    if (Array.isArray(children))
        return children.map(childText).join('');
    if (typeof children === 'object' && 'props' in children) {
        return childText(children.props.children);
    }
    return '';
}
function slugify(text) {
    const slug = text
        .toLowerCase()
        .trim()
        .replace(/<[^>]+>/g, '')
        .replace(/&[a-z0-9#]+;/gi, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || 'section';
}
function createMdxHeadingComponents() {
    const used = new Map();
    const heading = (Tag) => ({ children, ...props }) => {
        const base = slugify(childText(children));
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count + 1}`;
        return (_jsxs(Tag, { ...props, id: id, class: `pp-heading ${props.class ?? ''}`.trim(), children: [children, _jsx("a", { class: "pp-heading-anchor", href: `#${id}`, "aria-label": "Link to this section", children: "#" })] }));
    };
    return {
        h2: heading('h2'),
        h3: heading('h3')
    };
}
const Layout = ({ site, themeConfig, routePath, page }) => {
    const title = page?.title ? `${page.title} | ${site.title}` : site.title;
    const [query, setQuery] = useState('');
    const [activeHeading, setActiveHeading] = useState();
    const sidebarItems = (themeConfig.sidebar ?? []).flatMap((group) => group.items);
    const normalizedQuery = query.trim().toLowerCase();
    const visibleSidebar = useMemo(() => {
        if (!normalizedQuery)
            return themeConfig.sidebar ?? [];
        return (themeConfig.sidebar ?? [])
            .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery))
        }))
            .filter((group) => group.items.length > 0);
    }, [normalizedQuery, themeConfig.sidebar]);
    const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link));
    const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined;
    const next = activeIndex >= 0 && activeIndex < sidebarItems.length - 1
        ? sidebarItems[activeIndex + 1]
        : undefined;
    const showOutline = themeConfig.outline !== false && Boolean(page?.headings.length);
    const MdxComponent = page?.kind === 'mdx' ? page.Component : undefined;
    const mdxComponents = createMdxHeadingComponents();
    const editHref = themeConfig.editLink && page?.relativePath
        ? themeConfig.editLink.pattern.replace(/:path/g, page.relativePath)
        : undefined;
    const lastUpdated = page?.lastUpdated
        ? new Date(page.lastUpdated).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        : undefined;
    useEffect(() => {
        setQuery('');
    }, [routePath]);
    useEffect(() => {
        if (!page?.headings.length) {
            setActiveHeading(undefined);
            return;
        }
        const update = () => {
            const visible = page.headings
                .map((heading) => document.getElementById(heading.id))
                .filter((el) => Boolean(el))
                .filter((el) => el.getBoundingClientRect().top <= 96);
            setActiveHeading(visible.at(-1)?.id ?? page.headings[0]?.id);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, [page?.headings]);
    return (_jsxs("div", { class: "pp-layout", children: [_jsx("a", { class: "pp-skip-link", href: "#content", children: "Skip to content" }), _jsx("header", { class: "pp-nav", children: _jsxs("div", { class: "pp-nav-inner", children: [_jsx("a", { class: "pp-title", href: withBase(site.base, '/'), "aria-label": site.title, children: _jsx(Logo, { class: "pp-logo", label: site.title }) }), _jsxs("div", { class: "pp-nav-right", children: [_jsx("nav", { class: "pp-nav-links", children: (themeConfig.nav ?? []).map((item) => {
                                        const active = isActive(routePath, item.link);
                                        return (_jsx("a", { class: active ? 'active' : '', href: withBase(site.base, item.link), "aria-current": active ? 'page' : undefined, children: item.text }, item.link));
                                    }) }), _jsx(ThemeToggle, {})] })] }) }), _jsxs("div", { class: "pp-body", children: [_jsx("aside", { class: "pp-sidebar", "aria-label": "Site navigation", children: _jsxs("details", { class: "pp-sidebar-panel", open: true, children: [_jsx("summary", { children: "Navigation" }), themeConfig.search ? (_jsxs("label", { class: "pp-search", children: [_jsx("span", { children: "Search" }), _jsx("input", { type: "search", value: query, placeholder: "Filter pages", onInput: (event) => setQuery(event.currentTarget.value) })] })) : null, visibleSidebar.map((group, gi) => (_jsxs("div", { class: "pp-sidebar-group", children: [group.text ? (_jsx("div", { class: "pp-sidebar-heading", children: group.text })) : null, _jsx("ul", { children: group.items.map((it) => {
                                                const active = isActive(routePath, it.link);
                                                return (_jsx("li", { children: _jsx("a", { class: active ? 'active' : '', href: withBase(site.base, it.link), "aria-current": active ? 'page' : undefined, children: it.text }) }, it.link));
                                            }) })] }, gi)))] }) }), _jsx("main", { id: "content", class: "pp-main", children: _jsxs("article", { class: "pp-doc", children: [_jsx("h1", { class: "pp-doc-title", children: page?.title ?? title }), page?.description ? (_jsx("p", { class: "pp-doc-lead", children: page.description })) : null, MdxComponent ? (_jsx("div", { class: "pp-doc-content", children: _jsx(MdxComponent, { components: mdxComponents }) })) : (_jsx("div", { class: "pp-doc-content", dangerouslySetInnerHTML: { __html: page?.kind === 'markdown' ? page.html : '' } })), previous || next ? (_jsxs("nav", { class: "pp-pager", "aria-label": "Page navigation", children: [previous ? (_jsxs("a", { class: "pp-pager-link previous", href: withBase(site.base, previous.link), children: [_jsx("span", { children: "Previous" }), previous.text] })) : (_jsx("span", {})), next ? (_jsxs("a", { class: "pp-pager-link next", href: withBase(site.base, next.link), children: [_jsx("span", { children: "Next" }), next.text] })) : null] })) : null, themeConfig.lastUpdated || editHref ? (_jsxs("footer", { class: "pp-doc-meta", children: [themeConfig.lastUpdated && lastUpdated ? (_jsxs("span", { children: ["Last updated ", lastUpdated] })) : null, editHref ? (_jsx("a", { href: editHref, children: themeConfig.editLink?.text ?? 'Edit this page' })) : null] })) : null] }) }), showOutline ? (_jsxs("aside", { class: "pp-outline", "aria-label": "On this page", children: [_jsx("div", { class: "pp-outline-heading", children: "On this page" }), _jsx("nav", { children: page?.headings.map((heading) => (_jsx("a", { class: `level-${heading.level}${activeHeading === heading.id ? ' active' : ''}`, href: `#${heading.id}`, children: heading.text }, heading.id))) })] })) : null] }), themeConfig.footer ? (_jsx("footer", { class: "pp-footer", children: themeConfig.footer })) : null] }));
};
export default Layout;
//# sourceMappingURL=Layout.js.map