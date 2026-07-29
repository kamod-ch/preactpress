import type { PlaygroundFiles, PlaygroundDependencies, PreviewTheme } from "./types.js";
/** Build a StackBlitz project URL for the current playground files. */
export declare function buildStackBlitzUrl(options: {
  files: PlaygroundFiles;
  entry: string;
  dependencies: PlaygroundDependencies;
  title?: string;
}): string;
/** Open StackBlitz in a new tab with the current project. */
export declare function openStackBlitz(url: string): void;
/** Copy text to the clipboard when available. */
export declare function copyToClipboard(text: string): Promise<boolean>;
export declare function previewWidthPx(width: "desktop" | "tablet" | "mobile"): number;
export declare function isDarkPreviewTheme(theme: PreviewTheme): boolean;
//# sourceMappingURL=utils.d.ts.map
