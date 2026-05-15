import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import { describe, expect, it } from 'vitest'
import {
  collectTagSlugMap,
  renderTagIndexHtml,
  slugifyTagSegment,
  tagIndexPageRoute
} from '../src/node/tagIndex.js'
import { scanContentFiles } from '../src/node/content.js'
import type { SiteConfig } from '../src/node/siteConfig.js'

describe('tagIndex', () => {
  it('slugifies tags for URL segments', () => {
    expect(slugifyTagSegment('React Hooks')).toBe('react-hooks')
    expect(slugifyTagSegment('  news  ')).toBe('news')
  })

  it('renders tag index HTML', () => {
    const html = renderTagIndexHtml('react', 'React', [
      { route: '/guide', title: 'Guide' },
      { route: '/post/a', title: undefined }
    ])
    expect(html).toContain('Pages tagged: React')
    expect(html).toContain('href="/guide"')
    expect(html).toContain('Guide')
    expect(html).toContain('href="/post/a"')
    expect(html).toContain('/post/a')
  })

  it('collects tags from markdown frontmatter', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-tags-'))
    try {
      await fs.writeFile(
        path.join(root, 'a.md'),
        '---\ntags: [alpha, shared]\ntitle: A\n---\n',
        'utf8'
      )
      await fs.writeFile(
        path.join(root, 'b.md'),
        '---\ntag: beta\ntags: shared\ntitle: B\n---\n',
        'utf8'
      )
      const files = await scanContentFiles({ srcDir: root } as SiteConfig)
      const map = collectTagSlugMap(files)
      expect(tagIndexPageRoute('alpha')).toBe('/tags/alpha')
      expect(map.get('alpha')?.items.map((i) => i.route)).toEqual(['/a'])
      expect(map.get('beta')?.items.map((i) => i.route)).toEqual(['/b'])
      expect(map.get('shared')?.items.map((i) => i.route).sort()).toEqual(['/a', '/b'])
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
