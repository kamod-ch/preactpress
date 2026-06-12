import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PACKAGE_ROOT } from './packageRoot.js'

export interface InitResult {
  root: string
  preactpressVersion: string
  template: InitTemplateName
}

export const INIT_TEMPLATES = ['default', 'docs', 'magazine', 'hono'] as const
export type InitTemplateName = (typeof INIT_TEMPLATES)[number]

export interface InitOptions {
  template?: string
}

const SKIP_TEMPLATE_ENTRIES = new Set(['dist', 'node_modules', 'pnpm-lock.yaml'])
const TEMPLATE_DIRS: Record<InitTemplateName, string> = {
  default: path.join('templates', 'default'),
  docs: path.join('templates', 'docs'),
  magazine: path.join('templates', 'magazine'),
  hono: path.join('templates', 'hono')
}

function shouldCopyTemplateEntry(rel: string): boolean {
  if (!rel) return true
  const top = rel.split(path.sep)[0]
  if (SKIP_TEMPLATE_ENTRIES.has(top) || SKIP_TEMPLATE_ENTRIES.has(rel)) return false
  return true
}

async function readPreactpressVersion(): Promise<string> {
  const pkgPath = path.join(PACKAGE_ROOT, 'package.json')
  const raw = await fs.readFile(pkgPath, 'utf8')
  const pkg = JSON.parse(raw) as { version?: string }
  if (!pkg.version) throw new Error('preactpress: missing version in package.json')
  return pkg.version
}

async function linkLocalPreactpress(targetRoot: string): Promise<void> {
  const nodeModules = path.join(targetRoot, 'node_modules')
  const linkPath = path.join(nodeModules, 'preactpress')
  await fs.mkdir(nodeModules, { recursive: true })
  try {
    const existing = await fs.readlink(linkPath)
    if (path.resolve(path.dirname(linkPath), existing) === PACKAGE_ROOT) return
    await fs.rm(linkPath, { recursive: true, force: true })
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code !== 'ENOENT' && code !== 'EINVAL' && code !== 'ELOOP') throw err
    try {
      await fs.rm(linkPath, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  }
  await fs.symlink(PACKAGE_ROOT, linkPath, 'dir')
}

async function patchStarterPackageJson(targetRoot: string, preactpressVersion: string): Promise<void> {
  const pkgPath = path.join(targetRoot, 'package.json')
  const raw = await fs.readFile(pkgPath, 'utf8')
  const pkg = JSON.parse(raw) as {
    devDependencies?: Record<string, string>
  }
  pkg.devDependencies = pkg.devDependencies ?? {}
  pkg.devDependencies.preactpress = `^${preactpressVersion}`
  await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

function resolveTemplateName(template: string | undefined): InitTemplateName {
  const name = template ?? 'default'
  if (INIT_TEMPLATES.includes(name as InitTemplateName)) return name as InitTemplateName
  throw new Error(
    `unknown init template "${name}". Available templates: ${INIT_TEMPLATES.join(', ')}`
  )
}

export async function init(targetRoot: string, options: InitOptions = {}): Promise<InitResult> {
  const template = resolveTemplateName(options.template)
  const here = path.dirname(fileURLToPath(import.meta.url))
  const templateDir = path.resolve(here, '../..', TEMPLATE_DIRS[template])
  const resolvedRoot = path.resolve(targetRoot)

  await fs.cp(templateDir, resolvedRoot, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(templateDir, src)
      return shouldCopyTemplateEntry(rel)
    }
  })

  const preactpressVersion = await readPreactpressVersion()
  await patchStarterPackageJson(resolvedRoot, preactpressVersion)
  await linkLocalPreactpress(resolvedRoot)

  return { root: resolvedRoot, preactpressVersion, template }
}
