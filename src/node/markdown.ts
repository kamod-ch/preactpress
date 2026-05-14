import fs from 'node:fs'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { createHighlighter, type Highlighter } from 'shiki'

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
}

export async function renderMarkdown(
  raw: string,
  _filePathForDebug?: string
): Promise<RenderedMarkdown> {
  const { data, content } = matter(raw)
  const meta = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const hi = await getHighlighter()

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

  md.renderer.rules.fence = (tokens, idx): string => {
    const token = tokens[idx]
    const info = (token.info || '').trim()
    const langRaw = (info.split(/\s+/)[0] || 'plaintext').toLowerCase()
    const lang = SHIKI_LANG_MAP[langRaw] ?? langRaw
    const code = token.content.replace(/\n$/, '')
    try {
      return hi.codeToHtml(code, {
        lang,
        theme: 'github-light'
      })
    } catch {
      return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
    }
  }

  const html = md.render(content)
  const title =
    typeof meta.title === 'string' ? meta.title : undefined
  const description =
    typeof meta.description === 'string' ? meta.description : undefined

  return { meta, html, title, description }
}

export function readMarkdownFile(absPath: string): Promise<RenderedMarkdown> {
  const raw = fs.readFileSync(absPath, 'utf8')
  return renderMarkdown(raw, absPath)
}
