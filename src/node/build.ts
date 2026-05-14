import path from 'node:path'
import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { build as viteBuild, mergeConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolveConfigForBuild } from './config.js'
import type { SiteConfig } from './siteConfig.js'
import { PACKAGE_ROOT } from './packageRoot.js'
import { preactPressMdxPlugin } from './mdx.js'
import { listMarkdownRoutes, preactPressPlugin } from './plugin.js'
import { resolveDependency } from './resolveDeps.js'

const CLIENT_ALIAS = 'preactpress/app'

function clientEntry(): string {
  return path.join(PACKAGE_ROOT, 'src/client/entry-client.tsx')
}

function ssrEntry(): string {
  return path.join(PACKAGE_ROOT, 'src/client/entry-ssr.tsx')
}

export function publicUrl(siteBase: string, file: string): string {
  const b = siteBase === '/' ? '' : siteBase.replace(/\/$/, '')
  const f = file.startsWith('/') ? file : `/${file}`
  return `${b}${f}`
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function readManifest(
  outDir: string
): Promise<Record<string, { file?: string; css?: string[]; isEntry?: boolean }>> {
  const candidates = [
    path.join(outDir, 'manifest.json'),
    path.join(outDir, '.vite', 'manifest.json')
  ]
  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, 'utf8')
      return JSON.parse(raw) as Record<
        string,
        { file?: string; css?: string[]; isEntry?: boolean }
      >
    } catch {
      /* try next */
    }
  }
  throw new Error('preactpress: could not read Vite client manifest')
}

export function pickMainEntry(
  manifest: Record<string, { file?: string; css?: string[]; isEntry?: boolean }>
): { file: string; css: string[] } {
  const main = manifest['main']
  if (main?.file?.endsWith('.js')) {
    return { file: main.file, css: main.css ?? [] }
  }
  for (const chunk of Object.values(manifest)) {
    if (chunk.isEntry && chunk.file?.endsWith('.js')) {
      return { file: chunk.file, css: chunk.css ?? [] }
    }
  }
  throw new Error('preactpress: no entry chunk in manifest')
}

export function routeToOutPath(route: string): string {
  if (route === '/') return 'index.html'
  const clean = route.replace(/^\//, '')
  return path.join(clean, 'index.html')
}

export async function build(root?: string): Promise<void> {
  const site = await resolveConfigForBuild(root)
  const clientOut = path.join(site.cacheDir, 'pp-client')
  const ssrOut = path.join(site.cacheDir, 'pp-ssr')

  await fs.rm(site.outDir, { recursive: true, force: true })
  await fs.mkdir(site.outDir, { recursive: true })
  await fs.mkdir(clientOut, { recursive: true })
  await fs.mkdir(ssrOut, { recursive: true })

  const shared = {
    root: site.srcDir,
    base: site.site.base,
    customLogger: site.logger,
    plugins: [preactPressMdxPlugin(), preact(), preactPressPlugin(site)],
    resolve: {
      alias: [
        { find: CLIENT_ALIAS, replacement: clientEntry() },
        { find: /^preact\/jsx-dev-runtime$/, replacement: resolveDependency('preact/jsx-dev-runtime') },
        { find: /^preact\/jsx-runtime$/, replacement: resolveDependency('preact/jsx-runtime') },
        { find: /^preact\/devtools$/, replacement: resolveDependency('preact/devtools') },
        { find: /^preact\/hooks$/, replacement: resolveDependency('preact/hooks') },
        { find: /^preact$/, replacement: resolveDependency('preact') }
      ]
    }
  }

  await viteBuild(
    mergeConfig(
      mergeConfig(shared, site.vite ?? {}),
      {
        root: site.srcDir,
        base: site.site.base,
        build: {
          manifest: true,
          outDir: clientOut,
          emptyOutDir: true,
          rollupOptions: {
            input: { main: CLIENT_ALIAS }
          }
        }
      }
    )
  )

  await viteBuild(
    mergeConfig(
      mergeConfig(shared, site.vite ?? {}),
      {
        root: site.srcDir,
        base: site.site.base,
        build: {
          ssr: true,
          outDir: ssrOut,
          emptyOutDir: true,
          rollupOptions: {
            input: ssrEntry(),
            output: {
              format: 'esm',
              entryFileNames: 'entry-ssr.js'
            }
          },
          copyPublicDir: false
        }
      }
    )
  )

  const manifest = await readManifest(clientOut)
  const main = pickMainEntry(manifest)

  const ssrAbs = path.join(ssrOut, 'entry-ssr.js')
  const mod = (await import(pathToFileURL(ssrAbs).href)) as {
    render: (route: string) => { body: string; title: string; description: string }
  }

  await copyClientAssets(clientOut, site.outDir)

  const routes = await listMarkdownRoutes(site)
  if (!routes.includes('/')) {
    throw new Error('preactpress: add an index.md or index.mdx at the site root')
  }

  for (const route of routes) {
    const { body, title, description } = mod.render(route)
    const html = pageHtml({
      site,
      body,
      title,
      description,
      route,
      mainJs: main.file,
      mainCss: main.css
    })
    const outFile = path.join(site.outDir, routeToOutPath(route))
    await fs.mkdir(path.dirname(outFile), { recursive: true })
    await fs.writeFile(outFile, html, 'utf8')
  }

  const notFound = mod.render('/404')
  await fs.writeFile(
    path.join(site.outDir, '404.html'),
    pageHtml({
      site,
      body: notFound.body,
      title: notFound.title,
      description: notFound.description,
      route: '/404',
      mainJs: main.file,
      mainCss: main.css
    }),
    'utf8'
  )
}

async function copyClientAssets(fromDir: string, toDir: string): Promise<void> {
  const entries = await fs.readdir(fromDir, { withFileTypes: true })
  for (const ent of entries) {
    if (ent.name === '.vite') continue
    const src = path.join(fromDir, ent.name)
    const dest = path.join(toDir, ent.name)
    await fs.cp(src, dest, { recursive: true })
  }
}

function pageHtml(opts: {
  site: SiteConfig
  body: string
  title: string
  description: string
  route: string
  mainJs: string
  mainCss: string[]
}): string {
  const { site, body, title, description, route, mainJs, mainCss } = opts
  const base = site.site.base
  const cssTags = mainCss
    .map((c) => {
      const href = publicUrl(base, `${c}`)
      return `<link rel="stylesheet" crossorigin href="${escapeHtml(href)}">`
    })
    .join('\n    ')
  const scriptSrc = escapeHtml(publicUrl(base, mainJs))
  const routeJson = JSON.stringify(route)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <title>${escapeHtml(title)}</title>
    ${cssTags}
  </head>
  <body>
    <script>window.__PREACTPRESS_ROUTE__=${routeJson}</script>
    <div id="app">${body}</div>
    <script type="module" crossorigin src="${scriptSrc}"></script>
  </body>
</html>
`
}
