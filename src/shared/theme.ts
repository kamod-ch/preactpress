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

function prefersDarkColorScheme(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(theme: PreactpressStoredTheme | null): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === null) {
    root.removeAttribute("data-theme");
    root.classList.toggle("dark", prefersDarkColorScheme());
    return;
  }
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
}

/** Synced into dev `index.html` (via Vite plugin) and production HTML (`build.ts`) before first paint. */
export const PREACTPRESS_THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  PREACTPRESS_THEME_STORAGE_KEY,
)};var m=localStorage.getItem(k);var r=document.documentElement;if(m==='light'||m==='dark'){r.setAttribute('data-theme',m);r.classList.toggle('dark',m==='dark');}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){r.classList.add('dark');}}catch(e){}})();`;
