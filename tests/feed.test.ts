import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { writeAtomFeed } from '../src/node/feed.js'
import type { SiteConfig } from '../src/node/siteConfig.js'

describe('writeAtomFeed', () => {
  it('writes atom entries for published pages', async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-feed-'))
    try {
      await writeAtomFeed(
        {
          outDir,
          site: {
            title: 'Docs',
            description: '',
            base: '/',
            lang: 'en',
            url: 'https://example.com'
          }
        } as SiteConfig,
        [
          {
            route: '/guide',
            page: {
              kind: 'markdown',
              html: '<p>Guide</p>',
              title: 'Guide',
              description: 'Read the guide',
              meta: {},
              headings: [],
              lastUpdated: '2026-05-27T10:00:00.000Z'
            }
          }
        ]
      )

      const feed = await fs.readFile(path.join(outDir, 'feed.xml'), 'utf8')
      expect(feed).toContain('<title>Guide</title>')
      expect(feed).toContain('<link href="https://example.com/guide/" />')
      expect(feed).toContain('<summary>Read the guide</summary>')
    } finally {
      await fs.rm(outDir, { recursive: true, force: true })
    }
  })
})
