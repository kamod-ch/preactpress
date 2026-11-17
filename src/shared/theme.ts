export const PREACTPRESS_THEME_STORAGE_KEY = "preactpress-theme" as const;
/** Same key `@kamod-ch/themes` uses, so a PreactPress toggle and Kamod UI stay on one scheme. */
export const KAMOD_COLOR_SCHEME_KEY = "theme" as const;
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

/** Kamod presets use `data-theme` for the palette. Light and dark stay on `.dark`. */
export function ownsThemePreset(root: HTMLElement): boolean {
  const current = root.getAttribute("data-theme");
  return current !== null && current !== "light" && current !== "dark";
}

export function applyTheme(theme: PreactpressStoredTheme | null): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const dark = theme === "dark" || (theme === null && prefersDarkColorScheme());
  if (!ownsThemePreset(root)) {
    if (theme === null) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

/** Synced into dev `index.html` (via Vite plugin) and production HTML (`build.ts`) before first paint. */
export const PREACTPRESS_THEME_BOOT_SCRIPT = `(function(){try{var own=${JSON.stringify(
  PREACTPRESS_THEME_STORAGE_KEY,
)};var kamodKey=${JSON.stringify(
  KAMOD_COLOR_SCHEME_KEY,
)};var kamod=localStorage.getItem(kamodKey);var m=kamod==='light'||kamod==='dark'||kamod==='system'?kamod:localStorage.getItem(own);var r=document.documentElement;var current=r.getAttribute('data-theme');var dark=m==='dark'||(m!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(!(current&&current!=='light'&&current!=='dark')){if(m==='light'||m==='dark')r.setAttribute('data-theme',m);else r.removeAttribute('data-theme');}r.classList.toggle('dark',dark);r.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;
