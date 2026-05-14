import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export function resolvePackageDir(id: string): string {
  return path.dirname(require.resolve(`${id}/package.json`))
}

export function resolveDependency(id: string): string {
  return require.resolve(id)
}
