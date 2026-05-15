import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { createLogger, loadConfigFromFile, normalizePath, type ConfigEnv } from 'vite'
import type { SiteConfig, UserConfig } from './siteConfig.js'
import { resolveConfigDir, resolveConfigPath } from './paths.js'
import { DEFAULT_THEME_LAYOUT, PACKAGE_ROOT } from './packageRoot.js'
import { defaultFaviconHead, hasFaviconHead } from './favicon.js'

function fileExists(p: string): boolean {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

function sameProjectRoot(a: string, b: string): boolean {
  const ra = path.resolve(a)
  const rb = path.resolve(b)
  if (ra === rb) return true
  try {
    return fs.realpathSync(ra) === fs.realpathSync(rb)
  } catch {
    return false
  }
}

function resolveThemeLayout(root: string, configDir: string, theme: string): string {
  const abs = path.isAbsolute(theme)
    ? theme
    : path.resolve(configDir, theme)
  if (!fileExists(abs)) {
    throw new Error(`preactpress: theme Layout not found: ${abs}`)
  }
  return normalizePath(abs)
}

export async function resolveUserConfig(
  root: string,
  env: ConfigEnv
): Promise<UserConfig> {
  const configPath = resolveConfigPath(root)
  if (!fileExists(configPath)) {
    const resolvedRoot = path.resolve(root)
    const inToolPackage = sameProjectRoot(resolvedRoot, PACKAGE_ROOT)
    const hint = inToolPackage
      ? 'You are in the preactpress package (CLI sources), not a content site. From this folder run `pnpm run demo` to start the bundled `template/` site, or `pnpm run preactpress -- init <dir>` to scaffold a new site elsewhere.'
      : 'Run "preactpress init" to scaffold a site.'
    throw new Error(`preactpress: missing config at ${configPath}. ${hint}`)
  }

  const loaded = await loadConfigFromFile(env, configPath, root)
  if (!loaded?.config) {
    throw new Error(`preactpress: failed to load config from ${configPath}`)
  }

  const raw = loaded.config as UserConfig & { default?: UserConfig }
  const user = (raw.default ?? raw) as UserConfig
  if (!user || typeof user !== 'object') {
    throw new Error('preactpress: config must export a default object')
  }
  return user
}

export async function resolveConfig(
  rootArg?: string,
  command: ConfigEnv['command'] = 'serve',
  mode: string = 'development'
): Promise<SiteConfig> {
  const root = path.resolve(rootArg ?? process.cwd())
  const configDir = resolveConfigDir(root)
  const logger = createLogger()

  const user = await resolveUserConfig(root, { command, mode, isPreview: false })

  const srcDir = normalizePath(
    path.resolve(root, user.srcDir ?? '.')
  )
  const outDir = normalizePath(path.resolve(root, user.outDir ?? 'dist'))
  const cacheDir = normalizePath(
    path.resolve(root, user.cacheDir ?? 'node_modules/.preactpress')
  )

  const site = {
    title: user.site?.title ?? 'PreactPress',
    description: user.site?.description ?? '',
    base: normalizeBase(user.site?.base ?? '/'),
    lang: user.site?.lang ?? 'en',
    url: user.site?.url ? normalizeSiteUrl(user.site.url) : undefined
  }
  const markdown = {
    html: user.markdown?.html ?? false,
    linkify: user.markdown?.linkify ?? true,
    typographer: user.markdown?.typographer ?? true
  }

  const themePath = user.theme ?? DEFAULT_THEME_LAYOUT
  const theme = resolveThemeLayout(root, configDir, themePath)

  const baseConfig: SiteConfig = {
    root,
    srcDir,
    configDir,
    outDir,
    cacheDir,
    theme,
    site,
    themeConfig: user.themeConfig ?? {},
    markdown,
    head: [
      ...(hasFaviconHead(user.head ?? []) ? [] : defaultFaviconHead(site.base)),
      ...(user.head ?? [])
    ],
    transformHead: user.transformHead,
    build: {
      sitemap: user.build?.sitemap ?? true,
      robots: user.build?.robots ?? true
    },
    vite: user.vite ?? {},
    logger
  }

  return baseConfig
}

export function normalizeBase(base: string): string {
  if (!base.startsWith('/')) base = '/' + base
  if (base !== '/' && base.endsWith('/')) base = base.replace(/\/+$/, '')
  return base
}

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

export function siteConfigToClientJson(config: SiteConfig): string {
  return JSON.stringify({
    site: config.site,
    themeConfig: config.themeConfig
  })
}

/** For SSR: re-resolve config with production mode. */
export async function resolveConfigForBuild(
  root?: string
): Promise<SiteConfig> {
  return resolveConfig(root, 'build', 'production')
}

export { PACKAGE_ROOT }
