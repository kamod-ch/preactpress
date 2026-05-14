import path from 'node:path'

export const PREACTPRESS_DIR = '.preactpress'

export function resolveConfigDir(root: string): string {
  return path.resolve(root, PREACTPRESS_DIR)
}

export function resolveConfigPath(root: string): string {
  return path.resolve(root, PREACTPRESS_DIR, 'config.ts')
}

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}
