import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

export interface BuildCacheEntry {
  contentHash: string
  htmlPath: string
  contentPath?: string
  mtime: string
}

export interface BuildCache {
  routes: Record<string, BuildCacheEntry>
}

export async function readBuildCache(cacheDir: string): Promise<BuildCache> {
  try {
    const raw = await fs.readFile(cachePath(cacheDir), 'utf8')
    return JSON.parse(raw) as BuildCache
  } catch {
    return { routes: {} }
  }
}

export async function writeBuildCache(cacheDir: string, cache: BuildCache): Promise<void> {
  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(cachePath(cacheDir), JSON.stringify(cache, null, 2), 'utf8')
}

export function hashContent(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export async function fileExists(file: string): Promise<boolean> {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

export async function removeStaleRouteOutputs(
  outDir: string,
  previous: BuildCache,
  activeRoutes: Set<string>
): Promise<void> {
  for (const [route, entry] of Object.entries(previous.routes)) {
    if (activeRoutes.has(route)) continue
    await fs.rm(path.join(outDir, entry.htmlPath), { force: true })
    if (entry.contentPath) await fs.rm(path.join(outDir, entry.contentPath), { force: true })
  }
}

function cachePath(cacheDir: string): string {
  return path.join(cacheDir, 'build-manifest.json')
}
