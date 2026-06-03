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

  it('validates locale roots and locale-specific nav links', async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      locales: {
        root: { label: 'English', lang: 'en', themeConfig: { nav: [{ text: 'Home', link: '/' }] } },
        de: { label: 'Deutsch', lang: 'de', themeConfig: { nav: [{ text: 'Fehlt', link: '/de/missing' }] } }
      }
    }`)
    try {
      await fs.writeFile(path.join(root, 'index.md'), '# Home\n', 'utf8')
      const result = await check(root)

      expect(result.issues.map((issue) => issue.message)).toEqual([
        'missing locale root page: add de/index.md or de/index.mdx',
        'de nav item "Fehlt" points to missing route /de/missing (/de/missing)'
      ])
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
