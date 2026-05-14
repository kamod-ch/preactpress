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
export interface MarkdownMetadata {
    meta: Record<string, unknown>;
    title?: string;
    description?: string;
    headings: OutlineItem[];
}
export declare function renderMarkdown(raw: string, _filePathForDebug?: string, options?: MarkdownConfig & {
    route?: string;
    routes?: Iterable<string>;
}): Promise<RenderedMarkdown>;
export declare function readMarkdownMetadata(absPath: string): MarkdownMetadata;
export declare function extractMarkdownMetadata(raw: string): MarkdownMetadata;
export declare function readMarkdownFile(absPath: string, options?: MarkdownConfig & {
    route?: string;
    routes?: Iterable<string>;
}): Promise<RenderedMarkdown>;
//# sourceMappingURL=markdown.d.ts.map