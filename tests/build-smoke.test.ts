import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { build } from '../src/node/build.js'
import { init } from '../src/node/init.js'

describe('build smoke', () => {
  it('builds the starter site with assets and 404 output', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-build-'))
    try {
      await init(root)
      await build(root)

      const index = await fs.readFile(path.join(root, 'dist', 'index.html'), 'utf8')
      const markdown = await fs.readFile(
        path.join(root, 'dist', 'markdown-examples', 'index.html'),
        'utf8'
      )
      const interactive = await fs.readFile(
        path.join(root, 'dist', 'interactive', 'index.html'),
        'utf8'
      )
      const notFound = await fs.readFile(path.join(root, 'dist', '404.html'), 'utf8')

      expect(index).toContain('<div id="app">')
      expect(index).toContain('type="module"')
      expect(index).toContain('rel="stylesheet"')
      expect(markdown).toContain('Markdown examples')
      expect(interactive).toContain('Interactive MDX')
      expect(interactive).toContain('Count: 3')
      expect(notFound).toContain('404')
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
