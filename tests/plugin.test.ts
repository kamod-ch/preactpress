import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import { describe, expect, it } from 'vitest'
import { listMarkdownRoutes, mdFileToRoute } from '../src/node/plugin.js'
import type { SiteConfig } from '../src/node/siteConfig.js'

describe('mdFileToRoute', () => {
  const root = path.resolve('/site')

  it('maps index files and nested markdown and mdx files to clean routes', () => {
    expect(mdFileToRoute(root, path.join(root, 'index.md'))).toBe('/')
    expect(mdFileToRoute(root, path.join(root, 'index.mdx'))).toBe('/')
    expect(mdFileToRoute(root, path.join(root, 'guide', 'index.md'))).toBe('/guide')
    expect(mdFileToRoute(root, path.join(root, 'guide', 'index.mdx'))).toBe('/guide')
    expect(mdFileToRoute(root, path.join(root, 'guide', 'intro.md'))).toBe('/guide/intro')
    expect(mdFileToRoute(root, path.join(root, 'guide', 'intro.mdx'))).toBe('/guide/intro')
  })

  it('lists md and mdx routes', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-routes-'))
    try {
      await fs.mkdir(path.join(root, 'guide'), { recursive: true })
      await fs.writeFile(path.join(root, 'index.mdx'), '# Home\n', 'utf8')
      await fs.writeFile(path.join(root, 'guide', 'intro.md'), '# Intro\n', 'utf8')

      await expect(listMarkdownRoutes({ srcDir: root } as SiteConfig)).resolves.toEqual([
        '/',
        '/guide/intro'
      ])
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('rejects md and mdx files that map to the same route', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-routes-'))
    try {
      await fs.writeFile(path.join(root, 'guide.md'), '# Guide\n', 'utf8')
      await fs.writeFile(path.join(root, 'guide.mdx'), '# Guide\n', 'utf8')

      await expect(listMarkdownRoutes({ srcDir: root } as SiteConfig)).rejects.toThrow(
        'preactpress: route collision for /guide'
      )
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
