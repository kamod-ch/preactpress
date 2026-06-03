import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PACKAGE_ROOT } from './packageRoot.js'

export interface InitResult {
  root: string
  preactpressVersion: string
}

const SKIP_TEMPLATE_ENTRIES = new Set(['dist', 'node_modules', 'pnpm-lock.yaml'])

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

export async function init(targetRoot: string): Promise<InitResult> {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const templateDir = path.resolve(here, '../../template')
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

  return { root: resolvedRoot, preactpressVersion }
}
