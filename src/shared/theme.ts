export const PREACTPRESS_THEME_STORAGE_KEY = "preactpress-theme" as const;
export const PREACTPRESS_THEME_SCRIPT = "preactpress-theme.js" as const;

export type PreactpressStoredTheme = "light" | "dark";

export function readStoredTheme(): PreactpressStoredTheme | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const v = localStorage.getItem(PREACTPRESS_THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: PreactpressStoredTheme | null): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === null) root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

/** Synced into dev `index.html` (via Vite plugin) and production HTML (`build.ts`) before first paint. */
export const PREACTPRESS_THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  PREACTPRESS_THEME_STORAGE_KEY,
)};var m=localStorage.getItem(k);if(m==='light'||m==='dark')document.documentElement.setAttribute('data-theme',m);}catch(e){}})();`;
