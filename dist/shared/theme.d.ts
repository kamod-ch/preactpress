export declare const PREACTPRESS_THEME_STORAGE_KEY: "preactpress-theme";
export type PreactpressStoredTheme = 'light' | 'dark';
export declare function readStoredTheme(): PreactpressStoredTheme | null;
export declare function applyTheme(theme: PreactpressStoredTheme | null): void;
/** Synced into dev `index.html` (via Vite plugin) and production HTML (`build.ts`) before first paint. */
export declare const PREACTPRESS_THEME_BOOT_SCRIPT: string;
//# sourceMappingURL=theme.d.ts.map