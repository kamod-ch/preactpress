import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  hashContent,
  readBuildCache,
  removeStaleRouteOutputs,
  writeBuildCache
} from '../src/node/buildCache.js'

describe('build cache', () => {
  it('persists route hashes and removes stale route outputs', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-cache-'))
    try {
      const cacheDir = path.join(root, 'cache')
      const outDir = path.join(root, 'dist')
      await fs.mkdir(path.join(outDir, 'old'), { recursive: true })
      await fs.writeFile(path.join(outDir, 'old', 'index.html'), '<p>old</p>', 'utf8')

      const cache = {
        routes: {
          '/old': {
            contentHash: hashContent({ route: '/old' }),
            htmlPath: 'old/index.html',
            mtime: '2026-05-27T00:00:00.000Z'
          }
        }
      }
      await writeBuildCache(cacheDir, cache)
      await expect(readBuildCache(cacheDir)).resolves.toEqual(cache)

      await removeStaleRouteOutputs(outDir, cache, new Set(['/']))
      await expect(fs.access(path.join(outDir, 'old', 'index.html'))).rejects.toThrow()
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
