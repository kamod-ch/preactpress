import fs from 'node:fs/promises'
import path from 'node:path'
import c from 'picocolors'
import { resolveConfig } from './config.js'
import { fileHrefToRoute, scanContentFiles } from './content.js'
import { readMarkdownMetadata } from './markdown.js'
import { listTagIndexRoutes } from './tagIndex.js'
import type { SiteConfig } from './siteConfig.js'
import { normalizeRoute } from '../shared/route.js'
import { PAGE_LAYOUTS, isDraftPage, isPageLayout, pageLayoutFromMeta } from '../shared/pageMeta.js'
import { parseFeatures, parseHero } from '../shared/pageChrome.js'

export interface CheckIssue {
  level: 'error' | 'warning'
  message: string
}

export interface CheckResult {
  issues: CheckIssue[]
  routes: string[]
}

const MARKDOWN_LINK_RE = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const HTML_HREF_RE = /\bhref=["']([^"']+)["']/g

export async function check(root?: string): Promise<CheckResult> {
  const site = await resolveConfig(root, 'serve', 'development')
  const files = await scanContentFiles(site)
  const draftFiles = files.filter((file) => isDraftPage(readMarkdownMetadata(file.file).meta))
  const publishedFiles = files.filter((file) => !draftFiles.includes(file))
  const routes = publishedFiles.map((file) => file.route).sort()
  const routeSet = new Set(routes)
  const tagRoutes = await listTagIndexRoutes(site, routeSet)
  for (const tr of tagRoutes) routeSet.add(tr)
  const issues: CheckIssue[] = []

  const requiredRoots = site.i18n
    ? site.i18n.locales.map((locale) => locale.prefix || '/')
    : ['/']
  for (const rootRoute of requiredRoots) {
    if (routeSet.has(rootRoute)) continue
    issues.push({
      level: 'error',
      message:
        rootRoute === '/'
          ? 'missing root page: add index.md or index.mdx'
          : `missing locale root page: add ${rootRoute.replace(/^\//, '')}/index.md or ${rootRoute.replace(/^\//, '')}/index.mdx`
    })
  }

  checkConfiguredLinks(site, routeSet, issues)
  checkSeoDescriptions(site, publishedFiles, issues)
  checkPageLayouts(site, publishedFiles, issues)
  checkPageChrome(site, publishedFiles, routeSet, issues)
  for (const file of draftFiles) {
    issues.push({
      level: 'warning',
      message: `${path.relative(site.srcDir, file.file)} is marked draft and will be excluded from build output`
    })
  }

  for (const file of publishedFiles) {
    const raw = await fs.readFile(file.file, 'utf8')
    for (const href of extractLinks(raw)) {
      const target = fileHrefToRoute(href, file.route)
      if (!target) continue
      if (!routeSet.has(target)) {
        issues.push({
          level: 'error',
          message: `${path.relative(site.srcDir, file.file)} links to missing page ${href} (${target})`
        })
      }
    }
  }

  const allRoutes = [...routes, ...tagRoutes].sort()
  return { issues, routes: allRoutes }
}

function checkPageLayouts(
  site: SiteConfig,
  files: Awaited<ReturnType<typeof scanContentFiles>>,
  issues: CheckIssue[]
): void {
  for (const file of files) {
    const meta = readMarkdownMetadata(file.file).meta
    if (meta.layout === undefined || isPageLayout(meta.layout)) continue
    issues.push({
      level: 'warning',
      message: `${path.relative(site.srcDir, file.file)} uses unknown layout "${String(meta.layout)}" (expected ${PAGE_LAYOUTS.join(', ')})`
    })
  }
}

function checkPageChrome(
  site: SiteConfig,
  files: Awaited<ReturnType<typeof scanContentFiles>>,
  routes: Set<string>,
  issues: CheckIssue[]
): void {
  for (const file of files) {
    const meta = readMarkdownMetadata(file.file).meta
    const rel = path.relative(site.srcDir, file.file)
    const layout = pageLayoutFromMeta(meta)
    if (layout !== 'home' && (meta.hero !== undefined || meta.features !== undefined)) {
      issues.push({
        level: 'warning',
        message: `${rel} defines home-only frontmatter (hero/features) on layout "${layout}"`
      })
    }

    const hero = parseHero(meta.hero)
    for (const action of hero?.actions ?? []) {
      checkRouteLink(`${rel} hero action "${action.text}"`, action.link, routes, issues)
    }

    for (const feature of parseFeatures(meta.features)) {
      if (feature.link) {
        checkRouteLink(`${rel} feature "${feature.title}"`, feature.link, routes, issues)
      }
    }
  }
}

export function printCheckResult(result: CheckResult): void {
  console.log(c.bold(`PreactPress check: ${result.routes.length} route(s)`))
  for (const route of result.routes) console.log(`  ${c.dim('-')} ${route}`)

  if (result.issues.length === 0) {
    console.log(c.green('No issues found.'))
    return
  }

  for (const issue of result.issues) {
    const label = issue.level === 'error' ? c.red('error') : c.yellow('warning')
    console.log(`${label}: ${issue.message}`)
  }
}

function checkSeoDescriptions(
  site: SiteConfig,
  files: Awaited<ReturnType<typeof scanContentFiles>>,
  issues: CheckIssue[]
): void {
  if (site.site.description.trim()) return
  const missing = files.filter((file) => {
    const meta = readMarkdownMetadata(file.file)
    return typeof meta.description !== 'string' || !meta.description.trim()
  })
  if (missing.length > 0) {
    issues.push({
      level: 'warning',
      message: `site.description is empty and ${missing.length} page(s) lack frontmatter description (SEO meta may be missing)`
    })
  }
}

function checkConfiguredLinks(
  site: SiteConfig,
  routes: Set<string>,
  issues: CheckIssue[]
): void {
  for (const item of site.themeConfig.nav ?? []) {
    checkRouteLink(`nav item "${item.text}"`, item.link, routes, issues)
  }
  for (const group of site.themeConfig.sidebar ?? []) {
    for (const item of group.items) {
      checkRouteLink(`sidebar item "${item.text}"`, item.link, routes, issues)
    }
  }
  for (const locale of site.i18n?.locales ?? []) {
    for (const item of locale.themeConfig.nav ?? []) {
      checkRouteLink(`${locale.key} nav item "${item.text}"`, item.link, routes, issues)
    }
    for (const group of locale.themeConfig.sidebar ?? []) {
      for (const item of group.items) {
        checkRouteLink(`${locale.key} sidebar item "${item.text}"`, item.link, routes, issues)
      }
    }
  }
}

function checkRouteLink(
  label: string,
  link: string,
  routes: Set<string>,
  issues: CheckIssue[]
): void {
  if (/^(?:[a-z]+:)?\/\//i.test(link) || /^(?:mailto|tel):/i.test(link)) return
  const route = normalizeRoute(link)
  if (!routes.has(route)) {
    issues.push({
      level: 'error',
      message: `${label} points to missing route ${link} (${route})`
    })
  }
}

function extractLinks(raw: string): string[] {
  const links: string[] = []
  for (const match of raw.matchAll(MARKDOWN_LINK_RE)) links.push(match[1])
  for (const match of raw.matchAll(HTML_HREF_RE)) links.push(match[1])
  return links
}
