import fs from 'node:fs'
import path from 'node:path'
import { parseHeadingContent } from './markdownHeadings.js'
import {
  applyLineRange,
  dedentSnippet,
  extractRegion,
  findRegion,
  rawPathToToken,
  resolveSnippetPath
} from './markdownSnippets.js'
import { slugifySegment } from '../shared/slug.js'

const INCLUDE_RE = /<!--@include:\s*(.+?)-->/g
const MAX_INCLUDE_DEPTH = 12

export interface IncludeContext {
  srcDir?: string
  filePath?: string
}

function extractMarkdownSection(content: string, sectionId: string): string {
  const lines = content.split('\n')
  let start = -1
  let startLevel = 0

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^ {0,3}(#{1,6})\s+(.+)$/)
    if (!match) continue
    const { text, customId } = parseHeadingContent(match[2])
    const id = customId ?? slugifySegment(text)
    if (id !== sectionId) continue
    start = i
    startLevel = match[1].length
    break
  }

  if (start === -1) return ''

  const sectionLines: string[] = []
  for (let i = start; i < lines.length; i++) {
    const match = lines[i].match(/^ {0,3}(#{1,6})\s+/)
    if (match && match[1].length <= startLevel) break
    sectionLines.push(lines[i])
  }

  return sectionLines.join('\n').trim()
}

function extractRegionOrSection(content: string, name: string): string {
  const lines = content.split('\n')
  const region = findRegion(lines, name)
  if (region) {
    return dedentSnippet(
      lines
        .slice(region.start, region.end)
        .filter((line) => !(region.re.start.test(line) || region.re.end.test(line)))
        .join('\n')
    ).trim()
  }
  const section = extractMarkdownSection(content, name)
  return section || content
}

function loadIncludeContent(rawPath: string, ctx: IncludeContext, stack: string[]): string {
  const token = rawPathToToken(rawPath.trim())
  const absPath = resolveSnippetPath(token.filepath, ctx)

  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
    return `<!-- include not found: ${absPath} -->`
  }

  if (stack.includes(absPath)) {
    return `<!-- include cycle detected: ${absPath} -->`
  }

  let content = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n')

  if (token.region) {
    content = extractRegionOrSection(content, token.region.slice(1))
  }

  if (token.lines) {
    content = applyLineRange(content, token.lines)
  }

  const nestedCtx = { srcDir: ctx.srcDir, filePath: absPath }
  content = expandMarkdownIncludes(content, nestedCtx, [...stack, absPath])
  return content.trim()
}

export function expandMarkdownIncludes(
  content: string,
  ctx: IncludeContext,
  stack: string[] = []
): string {
  if (stack.length > MAX_INCLUDE_DEPTH) {
    return '<!-- include depth limit exceeded -->'
  }

  return content.replace(INCLUDE_RE, (_match, rawPath: string) => {
    return loadIncludeContent(rawPath, ctx, stack)
  })
}
