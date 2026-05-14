import fs from 'node:fs';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import { createHighlighter } from 'shiki';
let highlighter;
const SHIKI_LANGS = [
    'bash',
    'css',
    'diff',
    'html',
    'javascript',
    'json',
    'markdown',
    'plaintext',
    'tsx',
    'typescript',
    'yaml'
];
const SHIKI_LANG_MAP = {
    ts: 'typescript',
    js: 'javascript',
    md: 'markdown',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    text: 'plaintext',
    txt: 'plaintext'
};
export async function getHighlighter() {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-light'],
            langs: [...SHIKI_LANGS]
        });
    }
    return highlighter;
}
function escapeHtml(s) {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}
const DEFAULT_MARKDOWN_CONFIG = {
    html: false,
    linkify: true,
    typographer: true
};
export async function renderMarkdown(raw, _filePathForDebug, options = {}) {
    const { data, content } = matter(raw);
    const meta = normalizeMatterData(data);
    const config = { ...DEFAULT_MARKDOWN_CONFIG, ...options };
    const hi = await getHighlighter();
    const headings = [];
    const md = new MarkdownIt({
        html: config.html,
        linkify: config.linkify,
        typographer: config.typographer
    });
    const defaultHeadingOpen = md.renderer.rules.heading_open ??
        ((tokens, idx, rendererOptions, _env, self) => self.renderToken(tokens, idx, rendererOptions));
    const defaultLinkOpen = md.renderer.rules.link_open ??
        ((tokens, idx, rendererOptions, _env, self) => self.renderToken(tokens, idx, rendererOptions));
    md.renderer.rules.fence = (tokens, idx) => {
        const token = tokens[idx];
        const info = (token.info || '').trim();
        const langRaw = (info.split(/\s+/)[0] || 'plaintext').toLowerCase();
        const lang = SHIKI_LANG_MAP[langRaw] ?? langRaw;
        const code = token.content.replace(/\n$/, '');
        try {
            return hi.codeToHtml(code, {
                lang,
                themes: {
                    light: 'github-light',
                    dark: 'github-dark'
                }
            });
        }
        catch {
            return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
        }
    };
    md.renderer.rules.heading_open = (tokens, idx, rendererOptions, env, self) => {
        const token = tokens[idx];
        const level = Number(token.tag.slice(1));
        const inline = tokens[idx + 1];
        const text = inline?.type === 'inline' ? inline.content : '';
        const id = uniqueSlug(slugify(text), headings);
        token.attrSet('id', id);
        if (level >= 2 && level <= 3)
            headings.push({ id, text, level });
        return defaultHeadingOpen(tokens, idx, rendererOptions, env, self);
    };
    md.renderer.rules.link_open = (tokens, idx, rendererOptions, env, self) => {
        const token = tokens[idx];
        const href = token.attrGet('href') ?? '';
        if (/^https?:\/\//i.test(href)) {
            token.attrSet('target', '_blank');
            token.attrSet('rel', 'noreferrer');
        }
        return defaultLinkOpen(tokens, idx, rendererOptions, env, self);
    };
    const html = md.render(content);
    const title = typeof meta.title === 'string' ? meta.title : undefined;
    const description = typeof meta.description === 'string' ? meta.description : undefined;
    return { meta, html, title, description, headings };
}
export function readMarkdownMetadata(absPath) {
    const raw = fs.readFileSync(absPath, 'utf8');
    return extractMarkdownMetadata(raw);
}
export function extractMarkdownMetadata(raw) {
    const { data, content } = matter(raw);
    const meta = normalizeMatterData(data);
    const headings = extractHeadings(content);
    const title = typeof meta.title === 'string' ? meta.title : undefined;
    const description = typeof meta.description === 'string' ? meta.description : undefined;
    return { meta, title, description, headings };
}
function normalizeMatterData(data) {
    return (data && typeof data === 'object' ? data : {});
}
function extractHeadings(content) {
    const headings = [];
    const lines = content.split(/\r?\n/);
    let inFence = false;
    let fenceMarker = '';
    for (const line of lines) {
        const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);
        if (fence) {
            const marker = fence[1][0];
            if (!inFence) {
                inFence = true;
                fenceMarker = marker;
            }
            else if (marker === fenceMarker) {
                inFence = false;
                fenceMarker = '';
            }
            continue;
        }
        if (inFence)
            continue;
        const heading = line.match(/^ {0,3}(#{2,3})\s+(.+?)\s*#*\s*$/);
        if (!heading)
            continue;
        const level = heading[1].length;
        const text = heading[2]
            .replace(/<[^>]+>/g, '')
            .replace(/\{[^}]*\}/g, '')
            .replace(/[`*_~[\]]/g, '')
            .trim();
        if (!text)
            continue;
        const id = uniqueSlug(slugify(text), headings);
        headings.push({ id, text, level });
    }
    return headings;
}
function slugify(text) {
    const slug = text
        .toLowerCase()
        .trim()
        .replace(/<[^>]+>/g, '')
        .replace(/&[a-z0-9#]+;/gi, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || 'section';
}
function uniqueSlug(base, existing) {
    let id = base;
    let i = 1;
    const used = new Set(existing.map((h) => h.id));
    while (used.has(id)) {
        i += 1;
        id = `${base}-${i}`;
    }
    return id;
}
export function readMarkdownFile(absPath, options) {
    const raw = fs.readFileSync(absPath, 'utf8');
    return renderMarkdown(raw, absPath, options);
}
//# sourceMappingURL=markdown.js.map