import fs from 'node:fs'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { createHighlighter, type Highlighter } from 'shiki'
import type { MarkdownConfig, OutlineItem } from './siteConfig.js'

let highlighter: Highlighter | undefined

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
] as const

const SHIKI_LANG_MAP: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  md: 'markdown',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  text: 'plaintext',
  txt: 'plaintext'
}

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-light'],
      langs: [...SHIKI_LANGS]
    })
  }
  return highlighter
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export interface RenderedMarkdown {
  meta: Record<string, unknown>
  html: string
  title?: string
  description?: string
  headings: OutlineItem[]
}

const DEFAULT_MARKDOWN_CONFIG: Required<MarkdownConfig> = {
  html: false,
  linkify: true,
  typographer: true
}

export async function renderMarkdown(
  raw: string,
  _filePathForDebug?: string,
  options: MarkdownConfig = {}
): Promise<RenderedMarkdown> {
  const { data, content } = matter(raw)
  const meta = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const config = { ...DEFAULT_MARKDOWN_CONFIG, ...options }
  const hi = await getHighlighter()
  const headings: OutlineItem[] = []

  const md = new MarkdownIt({
    html: config.html,
    linkify: config.linkify,
    typographer: config.typographer
  })

  const defaultHeadingOpen =
    md.renderer.rules.heading_open ??
    ((tokens, idx, rendererOptions, _env, self) =>
      self.renderToken(tokens, idx, rendererOptions))
  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, rendererOptions, _env, self) =>
      self.renderToken(tokens, idx, rendererOptions))

  md.renderer.rules.fence = (tokens, idx): string => {
    const token = tokens[idx]
    const info = (token.info || '').trim()
    const langRaw = (info.split(/\s+/)[0] || 'plaintext').toLowerCase()
    const lang = SHIKI_LANG_MAP[langRaw] ?? langRaw
    const code = token.content.replace(/\n$/, '')
    try {
      return hi.codeToHtml(code, {
        lang,
        themes: {
          light: 'github-light',
          dark: 'github-dark'
        }
      })
    } catch {
      return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
    }
  }

  md.renderer.rules.heading_open = (tokens, idx, rendererOptions, env, self) => {
    const token = tokens[idx]
    const level = Number(token.tag.slice(1))
    const inline = tokens[idx + 1]
    const text = inline?.type === 'inline' ? inline.content : ''
    const id = uniqueSlug(slugify(text), headings)
    token.attrSet('id', id)
    if (level >= 2 && level <= 3) headings.push({ id, text, level })
    return defaultHeadingOpen(tokens, idx, rendererOptions, env, self)
  }

  md.renderer.rules.link_open = (tokens, idx, rendererOptions, env, self) => {
    const token = tokens[idx]
    const href = token.attrGet('href') ?? ''
    if (/^https?:\/\//i.test(href)) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noreferrer')
    }
    return defaultLinkOpen(tokens, idx, rendererOptions, env, self)
  }

  const html = md.render(content)
  const title =
    typeof meta.title === 'string' ? meta.title : undefined
  const description =
    typeof meta.description === 'string' ? meta.description : undefined

  return { meta, html, title, description, headings }
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z0-9#]+;/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'section'
}

function uniqueSlug(base: string, existing: OutlineItem[]): string {
  let id = base
  let i = 1
  const used = new Set(existing.map((h) => h.id))
  while (used.has(id)) {
    i += 1
    id = `${base}-${i}`
  }
  return id
}

export function readMarkdownFile(
  absPath: string,
  options?: MarkdownConfig
): Promise<RenderedMarkdown> {
  const raw = fs.readFileSync(absPath, 'utf8')
  return renderMarkdown(raw, absPath, options)
}
