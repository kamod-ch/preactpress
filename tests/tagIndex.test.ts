import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import { describe, expect, it } from 'vitest'
import {
  collectTagIndexPages,
  collectTagSlugMap,
  renderTagIndexHtml,
  slugifyTagSegment,
  tagIndexPageRoute
} from '../src/node/tagIndex.js'
import { scanContentFiles } from '../src/node/content.js'
import type { SiteConfig } from '../src/node/siteConfig.js'
import { resolvePageTags } from '../src/shared/tags.js'
import { resolveLocales } from '../src/shared/locale.js'

describe('tagIndex', () => {
  it('slugifies tags for URL segments', () => {
    expect(slugifyTagSegment('React Hooks')).toBe('react-hooks')
    expect(slugifyTagSegment('  news  ')).toBe('news')
  })

  it('resolves and deduplicates page tags by slug', () => {
    expect(resolvePageTags({ tags: ['React Hooks', 'react hooks'], tag: 'News' })).toEqual([
      'React Hooks',
      'News'
    ])
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

  it('groups tag indexes per locale', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-locale-tags-'))
    try {
      await fs.mkdir(path.join(root, 'de'), { recursive: true })
      await fs.writeFile(
        path.join(root, 'index.md'),
        '---\ntags: [shared]\ntitle: Home\n---\n',
        'utf8'
      )
      await fs.writeFile(
        path.join(root, 'de', 'index.md'),
        '---\ntags: [shared]\ntitle: Start\n---\n',
        'utf8'
      )
      const i18n = resolveLocales(
        {
          root: { label: 'English', lang: 'en' },
          de: { label: 'Deutsch', lang: 'de' }
        },
        { title: 'Docs', description: '', base: '/', lang: 'en' },
        {}
      )
      const files = await scanContentFiles({ srcDir: root } as SiteConfig)
      const pages = collectTagIndexPages(files, { i18n })

      expect(pages.map((page) => page.route)).toEqual(['/de/tags/shared', '/tags/shared'])
      expect(pages.find((page) => page.route === '/tags/shared')?.items).toEqual([
        { route: '/', title: 'Home' }
      ])
      expect(pages.find((page) => page.route === '/de/tags/shared')?.items).toEqual([
        { route: '/de', title: 'Start' }
      ])
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
