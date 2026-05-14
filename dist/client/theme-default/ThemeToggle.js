import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect } from 'preact/hooks';
import { PREACTPRESS_THEME_STORAGE_KEY, applyTheme, readStoredTheme } from '../../shared/theme.js';
function toggleTheme() {
    const stored = readStoredTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (stored === null && prefersDark);
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try {
        localStorage.setItem(PREACTPRESS_THEME_STORAGE_KEY, next);
    }
    catch {
        /* ignore quota / private mode */
    }
}
const ThemeToggle = () => {
    useEffect(() => {
        function onStorage(e) {
            if (e.key !== PREACTPRESS_THEME_STORAGE_KEY)
                return;
            const v = e.newValue;
            applyTheme(v === 'light' || v === 'dark' ? v : null);
        }
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    return (_jsxs("button", { type: "button", class: "pp-theme-toggle", onClick: toggleTheme, "aria-label": "Toggle light and dark theme", children: [_jsx("span", { class: "pp-theme-toggle-moon", "aria-hidden": "true", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "1.5", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" }) }) }), _jsx("span", { class: "pp-theme-toggle-sun", "aria-hidden": "true", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "1.5", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" }) }) })] }));
};
export default ThemeToggle;
//# sourceMappingURL=ThemeToggle.js.map