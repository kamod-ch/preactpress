import { type Highlighter } from 'shiki';
import type { MarkdownConfig, OutlineItem } from './siteConfig.js';
export declare function getHighlighter(): Promise<Highlighter>;
export interface RenderedMarkdown {
    meta: Record<string, unknown>;
    html: string;
    title?: string;
    description?: string;
    headings: OutlineItem[];
}
export declare function renderMarkdown(raw: string, _filePathForDebug?: string, options?: MarkdownConfig): Promise<RenderedMarkdown>;
export declare function readMarkdownFile(absPath: string, options?: MarkdownConfig): Promise<RenderedMarkdown>;
//# sourceMappingURL=markdown.d.ts.map