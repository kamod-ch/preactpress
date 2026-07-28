/** Virtual file map keyed by absolute-style paths (e.g. `/App.tsx`). */
export type PlaygroundFiles = Record<string, string>;
/** Dependency specifier → npm version, URL, or `workspace` (requires explicit URL mapping). */
export type PlaygroundDependencies = Record<string, string>;
export type PreviewTheme = "light" | "dark";
export type PreviewWidth = "desktop" | "tablet" | "mobile";
export interface PlaygroundProps {
    /** Single-file shorthand — equivalent to one entry in {@link files}. */
    code?: string;
    /** Virtual source files for multi-file examples. */
    files?: PlaygroundFiles;
    /** Entry module path inside {@link files}. Defaults to the first `.tsx` file or `/App.tsx`. */
    entry?: string;
    /** Extra npm dependencies resolved via the configured CDN allowlist. */
    dependencies?: PlaygroundDependencies;
    /** Disable editing while keeping live preview. */
    readOnly?: boolean;
    /** Show a StackBlitz export action. Defaults to `true`. */
    stackBlitz?: boolean;
    /** Initial preview color scheme. */
    previewTheme?: PreviewTheme;
    /** Initial preview viewport width preset. */
    previewWidth?: PreviewWidth;
    /** Accessible label for the playground region. */
    title?: string;
}
export interface PlaygroundPluginOptions {
    /** npm packages allowed to load from the CDN. Defaults to common Preact packages. */
    dependencyAllowlist?: string[];
    /** Base URL for external modules. Defaults to `https://esm.sh`. */
    esmCdnBase?: string;
    /** Map `workspace` specifiers to concrete CDN URLs (e.g. `@kamod/ui` → esm URL). */
    workspacePackages?: Record<string, string>;
}
export interface ResolvedPlaygroundState {
    files: PlaygroundFiles;
    entry: string;
    dependencies: PlaygroundDependencies;
}
export type SandboxMessage = {
    type: "pp-playground-run";
    files: PlaygroundFiles;
    entry: string;
    importMap: Record<string, string>;
    theme: PreviewTheme;
} | {
    type: "pp-playground-result";
    ok: true;
} | {
    type: "pp-playground-result";
    ok: false;
    message: string;
};
//# sourceMappingURL=types.d.ts.map