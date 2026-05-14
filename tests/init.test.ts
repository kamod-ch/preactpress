import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { init } from '../src/node/init.js'

describe('init', () => {
  it('scaffolds the starter without built template output', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-init-'))
    try {
      await init(root)
      await expect(fs.access(path.join(root, 'index.md'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, '.preactpress', 'config.ts'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'dist'))).rejects.toThrow()
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
