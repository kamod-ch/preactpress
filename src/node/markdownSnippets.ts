import fs from 'node:fs'
import path from 'node:path'

/**
 * raw path: "/path/to/file.ext#region {meta} [title]"
 * captures: filepath, extension, region, lines, lang, attrs, title
 */
const RAW_PATH_RE =
  /^(.+?(?:(?:\.([a-z0-9]+))?))(?:(#[\w-]+))?(?: ?(?:{(\d+(?:[,-]\d+)*)? ?(\S+)? ?(\S+)?}))? ?(?:\[(.+)\])?$/

export interface SnippetToken {
  filepath: string
  extension: string
  region: string
  lines: string
  lang: string
  attrs: string
  title: string
}

export function rawPathToToken(rawPath: string): SnippetToken {
  const [
    filepath = '',
    extension = '',
    region = '',
    lines = '',
    lang = '',
    attrs = '',
    rawTitle = ''
  ] = (RAW_PATH_RE.exec(rawPath) || []).slice(1)

  const title = rawTitle
  return { filepath, extension, region, lines, lang, attrs, title }
}

const REGION_MARKERS = [
  {
    start: /^\s*\/\/\s*#?region\b\s*(.*?)\s*$/,
    end: /^\s*\/\/\s*#endregion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*<!--\s*#region\b\s*(.*?)\s*-->\s*$/,
    end: /^\s*<!--\s*#endregion\b\s*(.*?)\s*-->\s*$/
  },
  {
    start: /^\s*\/\*\s*#region\b\s*(.*?)\s*\*\//,
    end: /^\s*\/\*\s*#endregion\b\s*(.*?)\s*\*\//
  },
  {
    start: /^\s*#[rR]egion\b\s*(.*?)\s*$/,
    end: /^\s*#[eE]nd ?[rR]egion\b\s*(.*?)\s*$/
  },
  {
    start: /^\s*#\s*#?region\b\s*(.*?)\s*$/,
    end: /^\s*#\s*#?endregion\b\s*(.*?)\s*$/
  }
]

export function applyLineRange(content: string, range: string): string {
  if (!range) return content
  const lines = content.split('\n')
  if (range.includes(',')) {
    const [fromRaw, toRaw] = range.split(',', 2)
    const start = fromRaw ? Number(fromRaw) : 1
    const end = toRaw ? Number(toRaw) : lines.length
    return lines.slice(start - 1, end).join('\n')
  }
  const line = Number(range)
  if (!Number.isFinite(line) || line < 1) return content
  return lines[line - 1] ?? ''
}

export function findRegion(lines: string[], regionName: string): { start: number; end: number; re: (typeof REGION_MARKERS)[number] } | null {
  let chosen: { re: (typeof REGION_MARKERS)[number]; start: number } | null = null
  for (let i = 0; i < lines.length; i++) {
    for (const re of REGION_MARKERS) {
      if (re.start.exec(lines[i])?.[1] === regionName) {
        chosen = { re, start: i + 1 }
        break
      }
    }
    if (chosen) break
  }
  if (!chosen) return null

  let counter = 1
  for (let i = chosen.start; i < lines.length; i++) {
    if (chosen.re.start.exec(lines[i])?.[1] === regionName) {
      counter++
      continue
    }
    const endRegion = chosen.re.end.exec(lines[i])?.[1]
    if (endRegion === regionName || endRegion === '') {
      if (--counter === 0) return { ...chosen, end: i }
    }
  }
  return null
}

export function dedentSnippet(text: string): string {
  const lines = text.split('\n')
  const minIndentLength = lines.reduce((acc, line) => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] !== ' ' && line[i] !== '\t') return Math.min(i, acc)
    }
    return acc
  }, Infinity)
  if (minIndentLength < Infinity) {
    return lines.map((line) => line.slice(minIndentLength)).join('\n')
  }
  return text
}

export function resolveSnippetPath(filepath: string, ctx: { srcDir?: string; filePath?: string }): string {
  const normalized = filepath.replace(/^@\//, '')
  if (filepath.startsWith('@/') && ctx.srcDir) {
    return path.resolve(ctx.srcDir, normalized)
  }
  if (ctx.filePath) {
    return path.resolve(path.dirname(ctx.filePath), filepath)
  }
  if (ctx.srcDir) {
    return path.resolve(ctx.srcDir, filepath)
  }
  return path.resolve(filepath)
}

export function extractRegion(content: string, regionName: string): string {
  if (!regionName) return content.replace(/\n$/, '')

  const lines = content.split('\n')
  const region = findRegion(lines, regionName)
  if (!region) return content.replace(/\n$/, '')

  return dedentSnippet(
    lines
      .slice(region.start, region.end)
      .filter((line) => !(region.re.start.test(line) || region.re.end.test(line)))
      .join('\n')
  ).replace(/\n$/, '')
}

function readSnippetContent(absPath: string, regionName: string): string {
  const content = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n')
  return extractRegion(content, regionName)
}

function fenceInfoFromToken(token: SnippetToken): string {
  const lang = token.lang || token.extension || 'plaintext'
  const highlight = token.lines ? `{${token.lines}}` : ''
  const title = token.title ? `[${token.title}]` : ''
  const extra = [token.attrs, title].filter(Boolean).join(' ')
  return `${lang}${highlight}${extra ? ` ${extra}` : ''}`.trim()
}

function expandSnippetLine(rawPath: string, ctx: { srcDir?: string; filePath?: string }): string {
  const token = rawPathToToken(rawPath)
  const absPath = resolveSnippetPath(token.filepath, ctx)
  const regionName = token.region ? token.region.slice(1) : ''

  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
    return `\`\`\`plaintext\nSnippet not found: ${absPath}\n\`\`\``
  }

  const content = readSnippetContent(absPath, regionName)
  const info = fenceInfoFromToken(token)
  return `\`\`\`${info}\n${content}\n\`\`\``
}

export function expandSnippetImports(
  content: string,
  ctx: { srcDir?: string; filePath?: string }
): string {
  const lines = content.split(/\r?\n/)
  const result: string[] = []
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
      result.push(line)
      continue
    }

    if (inFence) {
      result.push(line)
      continue
    }

    const snippetMatch = line.match(/^ {0,3}<<<\s+(.+?)\s*$/)
    if (snippetMatch) {
      result.push(expandSnippetLine(snippetMatch[1], ctx))
      continue
    }

    result.push(line)
  }

  return result.join('\n')
}
