import { type Highlighter } from 'shiki';
export declare function getHighlighter(): Promise<Highlighter>;
export interface RenderedMarkdown {
    meta: Record<string, unknown>;
    html: string;
    title?: string;
    description?: string;
}
export declare function renderMarkdown(raw: string, _filePathForDebug?: string): Promise<RenderedMarkdown>;
export declare function readMarkdownFile(absPath: string): Promise<RenderedMarkdown>;
//# sourceMappingURL=markdown.d.ts.map