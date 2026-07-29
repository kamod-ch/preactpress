import type { PlaygroundFiles, PreviewTheme } from "./types.js";
/** Escape text for safe inclusion in HTML text nodes. */
export declare function escapeHtml(value: string): string;
/** Static SSR fallback rendered without client JavaScript. */
export declare function renderPlaygroundFallbackHtml(options: {
  files: PlaygroundFiles;
  entry: string;
  title?: string;
  readOnly?: boolean;
}): string;
/** Build the sandbox iframe srcdoc document. Kept inline so the host bundle stays small. */
export declare function buildSandboxDocument(theme: PreviewTheme): string;
//# sourceMappingURL=static.d.ts.map
