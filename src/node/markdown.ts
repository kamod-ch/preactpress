import fs from 'node:fs'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { createHighlighter, type Highlighter } from 'shiki'
import type { MarkdownConfig, OutlineItem } from './siteConfig.js'
import { fileHrefToRoute } from './content.js'
import { normalizeRoute } from '../shared/route.js'
import { escapeHtml } from '../shared/escapeHtml.js'
import { slugifySegment, uniqueSlug } from '../shared/slug.js'

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
      themes: ['github-light', 'github-dark'],
      langs: [...SHIKI_LANGS]
    })
  }
  return highlighter
}

export interface RenderedMarkdown {
  meta: Record<string, unknown>
  html: string
  title?: string
  description?: string
  headings: OutlineItem[]
}

export interface MarkdownMetadata {
  meta: Record<string, unknown>
  title?: string
  description?: string
  headings: OutlineItem[]
}

const DEFAULT_MARKDOWN_CONFIG: Required<MarkdownConfig> = {
  html: false,
  linkify: true,
  typographer: true
}

interface MarkdownRenderEnv {
  highlighter: Highlighter
  headings: OutlineItem[]
  route?: string
  knownRoutes?: Set<string>
  localePrefix?: string
}

const markdownRenderers = new Map<string, MarkdownIt>()

function rendererCacheKey(config: Required<MarkdownConfig>): string {
  return JSON.stringify({
    html: config.html,
    linkify: config.linkify,
    typographer: config.typographer
  })
}

function getMarkdownRenderer(config: Required<MarkdownConfig>): MarkdownIt {
  const key = rendererCacheKey(config)
  const cached = markdownRenderers.get(key)
  if (cached) return cached

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
  const defaultHeadingClose =
    md.renderer.rules.heading_close ??
    ((tokens, idx, rendererOptions, _env, self) =>
      self.renderToken(tokens, idx, rendererOptions))

  md.renderer.rules.fence = (tokens, idx, _rendererOptions, env): string => {
    const renderEnv = env as MarkdownRenderEnv
    const token = tokens[idx]
    const info = (token.info || '').trim()
    const langRaw = (info.split(/\s+/)[0] || 'plaintext').toLowerCase()
    const lang = SHIKI_LANG_MAP[langRaw] ?? langRaw
    const code = token.content.replace(/\n$/, '')
    try {
      return renderEnv.highlighter.codeToHtml(code, {
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
    const renderEnv = env as MarkdownRenderEnv
    const token = tokens[idx]
    const level = Number(token.tag.slice(1))
    const inline = tokens[idx + 1]
    const text = inline?.type === 'inline' ? inline.content : ''
    const id = uniqueSlug(slugifySegment(text), renderEnv.headings)
    token.attrSet('id', id)
    token.attrJoin('class', 'pp-heading')
    if (level >= 2 && level <= 3) renderEnv.headings.push({ id, text, level })
    return defaultHeadingOpen(tokens, idx, rendererOptions, env, self)
  }

  md.renderer.rules.heading_close = (tokens, idx, rendererOptions, env, self) => {
    const open = tokens
      .slice(0, idx)
      .reverse()
      .find((token) => token.type === 'heading_open' && token.tag === tokens[idx].tag)
    const id = open?.attrGet('id')
    const anchor = id
      ? `<a class="pp-heading-anchor" href="#${escapeHtml(id)}" aria-label="Link to this section">#</a>`
      : ''
    return `${anchor}${defaultHeadingClose(tokens, idx, rendererOptions, env, self)}`
  }

  md.renderer.rules.link_open = (tokens, idx, rendererOptions, env, self) => {
    const renderEnv = env as MarkdownRenderEnv
    const token = tokens[idx]
    const href = token.attrGet('href') ?? ''
    if (renderEnv.route) {
      let targetRoute = fileHrefToRoute(href, renderEnv.route)
      if (
        targetRoute &&
        renderEnv.localePrefix &&
        href.startsWith('/') &&
        !targetRoute.startsWith(`${renderEnv.localePrefix}/`)
      ) {
        const localized = normalizeRoute(`${renderEnv.localePrefix}${targetRoute}`)
        if (renderEnv.knownRoutes?.has(localized)) targetRoute = localized
      }
      if (targetRoute && (!renderEnv.knownRoutes || renderEnv.knownRoutes.has(targetRoute))) {
        const hash = href.includes('#') ? `#${href.split('#').slice(1).join('#')}` : ''
        token.attrSet('href', `${targetRoute}${hash}`)
      }
    }
    if (/^https?:\/\//i.test(href)) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noopener noreferrer')
    }
    return defaultLinkOpen(tokens, idx, rendererOptions, env, self)
  }

  markdownRenderers.set(key, md)
  return md
}

export async function renderMarkdown(
  raw: string,
  _filePathForDebug?: string,
  options: MarkdownConfig & { route?: string; routes?: Iterable<string>; localePrefix?: string } = {}
): Promise<RenderedMarkdown> {
  const { data, content } = matter(raw)
  const meta = normalizeMatterData(data)
  const config = { ...DEFAULT_MARKDOWN_CONFIG, ...options }
  const hi = await getHighlighter()
  const headings: OutlineItem[] = []
  const route = options.route ? normalizeRoute(options.route) : undefined
  const knownRoutes = options.routes ? new Set([...options.routes].map(normalizeRoute)) : undefined

  const md = getMarkdownRenderer(config)
  const html = md.render(content, { highlighter: hi, headings, route, knownRoutes, localePrefix: options.localePrefix })
  const title =
    typeof meta.title === 'string' ? meta.title : undefined
  const description =
    typeof meta.description === 'string' ? meta.description : undefined

  return { meta, html, title, description, headings }
}

export function readMarkdownMetadata(absPath: string): MarkdownMetadata {
  const raw = fs.readFileSync(absPath, 'utf8')
  return extractMarkdownMetadata(raw)
}

export function extractMarkdownMetadata(raw: string): MarkdownMetadata {
  const { data, content } = matter(raw)
  const meta = normalizeMatterData(data)
  const headings = extractHeadings(content)
  const title =
    typeof meta.title === 'string' ? meta.title : undefined
  const description =
    typeof meta.description === 'string' ? meta.description : undefined

  return { meta, title, description, headings }
}

function normalizeMatterData(data: unknown): Record<string, unknown> {
  return (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
}

function extractHeadings(content: string): OutlineItem[] {
  const headings: OutlineItem[] = []
  const lines = content.split(/\r?\n/)
  let inFence = false
  let fenceMarker = ''

  for (const line of lines) {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fence) {
      const marker = fence[1][0]
      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (marker === fenceMarker) {
        inFence = false
        fenceMarker = ''
      }
      continue
    }
    if (inFence) continue

    const heading = line.match(/^ {0,3}(#{2,3})\s+(.+?)\s*#*\s*$/)
    if (!heading) continue

    const level = heading[1].length
    const text = heading[2]
      .replace(/<[^>]+>/g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/[`*_~[\]]/g, '')
      .trim()
    if (!text) continue

    const id = uniqueSlug(slugifySegment(text), headings)
    headings.push({ id, text, level })
  }

  return headings
}

export function readMarkdownFile(
  absPath: string,
  options?: MarkdownConfig & { route?: string; routes?: Iterable<string>; localePrefix?: string }
): Promise<RenderedMarkdown> {
  const raw = fs.readFileSync(absPath, 'utf8')
  return renderMarkdown(raw, absPath, options)
}
