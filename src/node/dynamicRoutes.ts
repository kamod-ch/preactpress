import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'tinyglobby'
import type { SiteConfig } from './siteConfig.js'
import { mdFileToRoute } from './content.js'
import { loadSiteModule } from './loadSiteModule.js'
import { normalizeRoute } from '../shared/route.js'
import type { ContentKind } from './content.js'

const BRACKET_RE = /\[([^\]]+)\]/g

export interface DynamicRouteEntry {
  route: string
  kind: ContentKind
  /** Virtual source used for rendering (template with substitutions). */
  source: string
  params: Record<string, string>
  props: Record<string, unknown>
  templateFile: string
}

export interface PathsModule {
  paths: () => Array<{ params: Record<string, string>; props?: Record<string, unknown> }>
}

function isBracketTemplate(file: string): boolean {
  return BRACKET_RE.test(path.basename(file))
}

function bracketKeys(file: string): string[] {
  const keys: string[] = []
  const base = path.basename(file)
  BRACKET_RE.lastIndex = 0
  let match = BRACKET_RE.exec(base)
  while (match) {
    keys.push(match[1])
    match = BRACKET_RE.exec(base)
  }
  return keys
}

function applyParamsToPath(relPath: string, params: Record<string, string>): string {
  let out = relPath
  for (const [key, value] of Object.entries(params)) {
    out = out.replaceAll(`[${key}]`, value)
  }
  if (out.endsWith('/index')) out = out.slice(0, -'/index'.length)
  if (out === 'index' || out === '') return '/'
  return normalizeRoute('/' + out)
}

function renderTemplate(raw: string, params: Record<string, string>, props: Record<string, unknown>): string {
  const scope = { params, props }
  return raw.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const parts = key.split('.')
    let value: unknown = scope
    for (const part of parts) {
      value = (value as Record<string, unknown> | undefined)?.[part]
    }
    return value == null ? '' : String(value)
  })
}

function pathsFileForTemplate(templateFile: string): string {
  const dir = path.dirname(templateFile)
  const base = path.basename(templateFile).replace(/\.mdx?$/, '.paths.ts')
  return path.join(dir, base)
}

export async function resolveDynamicRoutes(site: SiteConfig): Promise<DynamicRouteEntry[]> {
  const templates = await glob(['**/*.md', '**/*.mdx'], {
    cwd: site.srcDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.preactpress/**', ...(site.srcExclude ?? [])]
  })
  const entries: DynamicRouteEntry[] = []

  for (const templateFile of templates.sort()) {
    if (!isBracketTemplate(templateFile)) continue
    const pathsFile = pathsFileForTemplate(templateFile)
    try {
      await fs.access(pathsFile)
    } catch {
      throw new Error(
        `preactpress: dynamic template ${path.relative(site.srcDir, templateFile)} requires ${path.relative(site.srcDir, pathsFile)}`
      )
    }

    const mod = await loadSiteModule<PathsModule>(pathsFile, site.root)
    if (!mod?.paths || typeof mod.paths !== 'function') {
      throw new Error(`preactpress: ${path.relative(site.srcDir, pathsFile)} must export { paths() }`)
    }

    const relTemplate = path.relative(site.srcDir, templateFile).split(path.sep).join('/')
    const templateRaw = await fs.readFile(templateFile, 'utf8')
    const kind: ContentKind = templateFile.endsWith('.mdx') ? 'mdx' : 'markdown'
    const expectedKeys = bracketKeys(templateFile)

    for (const item of mod.paths()) {
      for (const key of expectedKeys) {
        if (!(key in item.params)) {
          throw new Error(
            `preactpress: ${path.relative(site.srcDir, pathsFile)} missing param "${key}" for ${relTemplate}`
          )
        }
      }
      const relResolved = relTemplate
        .replace(/\.mdx?$/, '')
        .split('/')
        .map((segment) => {
          let out = segment
          for (const [key, value] of Object.entries(item.params)) {
            out = out.replaceAll(`[${key}]`, value)
          }
          return out
        })
        .join('/')
      const route = applyParamsToPath(relResolved, item.params)
      const props = item.props ?? {}
      entries.push({
        route,
        kind,
        source: renderTemplate(templateRaw, item.params, props),
        params: item.params,
        props,
        templateFile
      })
    }
  }

  const byRoute = new Map<string, DynamicRouteEntry>()
  for (const entry of entries) {
    if (byRoute.has(entry.route)) {
      throw new Error(`preactpress: duplicate dynamic route ${entry.route}`)
    }
    byRoute.set(entry.route, entry)
  }
  return [...byRoute.values()].sort((a, b) => a.route.localeCompare(b.route))
}

export function isDynamicTemplateFile(file: string): boolean {
  return isBracketTemplate(file)
}

export function dynamicTemplateRoute(file: string, srcDir: string): string | undefined {
  if (!isBracketTemplate(file)) return undefined
  return mdFileToRoute(srcDir, file)
}
