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
      const tagIndex = await fs.readFile(
        path.join(root, 'dist', 'tags', 'markdown', 'index.html'),
        'utf8'
      )
      const deIndex = await fs.readFile(path.join(root, 'dist', 'de', 'index.html'), 'utf8')
      const deMarkdown = await fs.readFile(
        path.join(root, 'dist', 'de', 'markdown-examples', 'index.html'),
        'utf8'
      )
      const deTagIndex = await fs.readFile(
        path.join(root, 'dist', 'de', 'tags', 'markdown', 'index.html'),
        'utf8'
      )

      expect(index).toContain('<div id="app">')
      expect(index).toContain('<html lang="en">')
      expect(index).toContain('property="og:title"')
      expect(index).toContain('name="description"')
      expect(index).toMatch(/<meta name="description" content="[^"]+"/)
      expect(index).toContain('type="module"')
      expect(index).toContain('rel="stylesheet"')
      expect(index).toContain('href="/favicon.svg"')
      await expect(fs.access(path.join(root, 'dist', 'favicon.svg'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'dist', 'favicon.png'))).resolves.toBeUndefined()
      expect(markdown).toContain('Markdown examples')
      expect(interactive).toContain('Interactive MDX')
      expect(interactive).toContain('<span>3</span>')
      expect(markdown).not.toContain('name="keywords"')
      expect(markdown).toContain('property="article:tag" content="markdown"')
      expect(markdown).toContain('type="application/ld+json"')
      expect(markdown).toContain('src="/preactpress-theme.js"')
      expect(markdown).toContain('class="pp-doc-tags"')
      expect(markdown).toContain('href="/tags/markdown"')
      expect(deIndex).toContain('<html lang="de">')
      expect(deIndex).toContain('Willkommen')
      expect(deIndex).toContain('Deutsch')
      expect(deMarkdown).toContain('Markdown-Beispiele')
      expect(deMarkdown).toContain('href="/de/tags/markdown"')
      expect(notFound).toContain('404')
      expect(tagIndex).toContain('Pages tagged: markdown')
      expect(tagIndex).toContain('Markdown examples')
      expect(deTagIndex).toContain('Pages tagged: markdown')
      expect(deTagIndex).toContain('Markdown-Beispiele')
      await expect(fs.access(path.join(root, 'dist', 'preactpress-search.json'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'dist', 'preactpress-content', 'markdown-examples.json'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'dist', 'preactpress-theme.js'))).resolves.toBeUndefined()
      const search = JSON.parse(
        await fs.readFile(path.join(root, 'dist', 'preactpress-search.json'), 'utf8')
      ) as Array<{ route: string; locale?: string; title?: string; excerpt?: string }>
      expect(search.find((entry) => entry.route === '/markdown-examples')).toMatchObject({
        locale: 'root',
        title: 'Markdown examples'
      })
      expect(search.find((entry) => entry.route === '/de/markdown-examples')).toMatchObject({
        locale: 'de',
        title: 'Markdown-Beispiele'
      })
      const assets = await fs.readdir(path.join(root, 'dist', 'assets'))
      const mainJs = assets.find((file) => file.startsWith('main-') && file.endsWith('.js'))
      expect(mainJs).toBeTruthy()
      const mainBundle = await fs.readFile(path.join(root, 'dist', 'assets', mainJs!), 'utf8')
      expect(mainBundle).not.toContain('Use blockquotes for callouts')
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
