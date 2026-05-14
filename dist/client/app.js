import { jsx as _jsx } from "preact/jsx-runtime";
import { useMemo } from 'preact/hooks';
import Layout from 'virtual:preactpress-layout';
import { pages } from 'virtual:preactpress-pages';
import { site, themeConfig } from 'virtual:preactpress-site';
export function App({ routePath }) {
    const page = useMemo(() => {
        return (pages[routePath] ??
            pages['/404'] ?? {
            html: '<p>Page not found.</p>',
            title: '404',
            description: undefined,
            meta: {}
        });
    }, [routePath]);
    return (_jsx(Layout, { site: site, themeConfig: themeConfig, routePath: routePath, page: page }));
}
//# sourceMappingURL=app.js.map