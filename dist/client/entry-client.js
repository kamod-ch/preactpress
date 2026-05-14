import { jsx as _jsx } from "preact/jsx-runtime";
import { hydrate } from 'preact';
import { App } from './app.js';
function currentRoute() {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';
    let p = window.location.pathname;
    if (base && p.startsWith(base))
        p = p.slice(base.length) || '/';
    if (!p.startsWith('/'))
        p = `/${p}`;
    return (p.replace(/\/$/, '') || '/');
}
const el = document.getElementById('app');
if (el) {
    const initial = window
        .__PREACTPRESS_ROUTE__ ?? currentRoute();
    hydrate(_jsx(App, { routePath: initial }), el);
}
//# sourceMappingURL=entry-client.js.map