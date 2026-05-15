import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { check } from '../src/node/check.js'

async function makeSite(config: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-check-'))
  await fs.mkdir(path.join(root, '.preactpress'), { recursive: true })
  await fs.writeFile(path.join(root, '.preactpress', 'config.ts'), config, 'utf8')
  return root
}

describe('check', () => {
  it('reports missing nav/sidebar and markdown links', async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      themeConfig: {
        nav: [{ text: 'Missing', link: '/missing' }],
        sidebar: [{ items: [{ text: 'Home', link: '/' }] }]
      }
    }`)
    try {
      await fs.writeFile(path.join(root, 'index.md'), '[Broken](./missing.md)\n', 'utf8')
      const result = await check(root)

      expect(result.routes).toEqual(['/'])
      expect(result.issues.map((issue) => issue.message)).toEqual([
        'nav item "Missing" points to missing route /missing (/missing)',
        'index.md links to missing page ./missing.md (/missing)'
      ])
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
