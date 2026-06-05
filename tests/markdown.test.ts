import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('shiki', () => ({
  createHighlighter: async () => ({
    codeToHtml: (code: string, options?: { meta?: { __raw?: string } }) => {
      const meta = options?.meta?.__raw ?? ''
      return `<pre class="shiki" data-meta="${meta}"><code>${code}</code></pre>`
    },
    getLoadedLanguages: () => ['plaintext'],
    loadLanguage: async () => {}
  })
}))

const { extractMarkdownMetadata, renderMarkdown } = await import('../src/node/markdown.js')
const fixtureSnippet = path.join(import.meta.dirname, 'fixtures/sample-snippet.ts')

describe('renderMarkdown', () => {
  it('renders frontmatter, headings, and code fences', async () => {
    const page = await renderMarkdown(`---
title: Hello
description: Intro
---

## Start Here

\`\`\`ts
const answer = 42
\`\`\`
`)

    expect(page.title).toBe('Hello')
    expect(page.description).toBe('Intro')
    expect(page.headings).toEqual([{ id: 'start-here', text: 'Start Here', level: 2 }])
    expect(page.html).toContain('id="start-here"')
    expect(page.html).toContain('href="#start-here"')
    expect(page.html).toContain('const answer = 42')
  })

  it('escapes raw HTML by default and allows it when configured', async () => {
    const safe = await renderMarkdown('<script>alert(1)</script>')
    expect(safe.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')

    const trusted = await renderMarkdown('<section>Trusted</section>', undefined, {
      html: true
    })
    expect(trusted.html).toContain('<section>Trusted</section>')
  })

  it('renders custom containers', async () => {
    const page = await renderMarkdown(`::: tip
Use containers for callouts.
:::

::: warning Custom title
Watch for breaking changes.
:::

::: details More info
Expandable content here.
:::
`)

    expect(page.html).toContain('pp-container-tip')
    expect(page.html).toContain('pp-container-title')
    expect(page.html).toContain('Custom title')
    expect(page.html).toContain('pp-container-details')
    expect(page.html).toContain('<summary>More info</summary>')
  })

  it('renders GFM alerts as containers', async () => {
    const page = await renderMarkdown(`> [!NOTE]
> Useful information for readers.

> [!WARNING] Be careful
> This action cannot be undone.
`)

    expect(page.html).toContain('pp-container-note')
    expect(page.html).toContain('pp-container-warning')
    expect(page.html).toContain('Useful information for readers.')
    expect(page.html).toContain('Be careful')
  })

  it('highlights code lines from fence meta and inline notation', async () => {
    const metaPage = await renderMarkdown(`\`\`\`js{2}
const one = 1
const two = 2
\`\`\``)
    expect(metaPage.html).toContain('data-meta="{2}"')

    const inlinePage = await renderMarkdown(`\`\`\`js
const one = 1
const two = 2 // [!code highlight]
\`\`\``)
    expect(inlinePage.html).toContain('[!code highlight]')
  })

  it('imports code snippets from files', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'preactpress-snippet-'))
    const snippetPath = path.join(dir, 'example.ts')
    fs.writeFileSync(
      snippetPath,
      'const hidden = true\nexport const value = 42\nconst tail = false\n',
      'utf8'
    )
    const pagePath = path.join(dir, 'page.md')

    const page = await renderMarkdown('<<< ./example.ts{2}\n', pagePath, { srcDir: dir })
    expect(page.html).toContain('export const value = 42')
    expect(page.html).toContain('const hidden = true')
    expect(page.html).toContain('data-meta="{2}"')
  })

  it('uses custom heading anchor ids', async () => {
    const page = await renderMarkdown('## Custom anchor {#my-anchor}\n')
    expect(page.html).toContain('id="my-anchor"')
    expect(page.html).toContain('Custom anchor')
    expect(page.html).not.toContain('{#my-anchor}')
    expect(page.headings).toEqual([{ id: 'my-anchor', text: 'Custom anchor', level: 2 }])
  })

  it('renders inline table of contents', async () => {
    const page = await renderMarkdown(`## Intro

[[toc]]

## Details

### Subsection
`)
    expect(page.html).toContain('pp-inline-toc')
    expect(page.html).toContain('href="#intro"')
    expect(page.html).toContain('href="#details"')
    expect(page.html).toContain('href="#subsection"')
  })

  it('renders code groups with tab labels', async () => {
    const page = await renderMarkdown(`::: code-group

\`\`\`js [npm]
npm install preactpress
\`\`\`

\`\`\`js [pnpm]
pnpm add preactpress
\`\`\`

:::
`)
    expect(page.html).toContain('pp-code-group')
    expect(page.html).toContain('pp-code-group-tab')
    expect(page.html).toContain('npm install preactpress')
    expect(page.html).toContain('pnpm add preactpress')
  })

  it('includes markdown files via include comments', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'preactpress-include-'))
    fs.writeFileSync(path.join(dir, 'partial.md'), '## Included\n\nIncluded body.\n', 'utf8')
    const pagePath = path.join(dir, 'page.md')

    const page = await renderMarkdown(
      'Intro\n\n<!--@include: ./partial.md-->\n',
      pagePath,
      { srcDir: dir }
    )
    expect(page.html).toContain('Included body.')
    expect(page.headings.some((heading) => heading.text === 'Included')).toBe(true)
  })

  it('renders emoji when enabled', async () => {
    const page = await renderMarkdown('Ship it :tada:', undefined, { emoji: true })
    expect(page.html).toContain('🎉')
  })

  it('renders inline math when math is enabled', async () => {
    const page = await renderMarkdown('Inline $x^2$ and block:\n\n$$E = mc^2$$', undefined, {
      math: true
    })
    expect(page.html).toMatch(/class="[^"]*math[^"]*"/i)
  })

  it('imports regions from snippets', async () => {
    const page = await renderMarkdown(`<<< ${fixtureSnippet}#greet\n`, fixtureSnippet, {
      srcDir: path.dirname(fixtureSnippet)
    })

    expect(page.html).toContain('export function greet')
    expect(page.html).not.toContain('unused = true')
  })

  it('marks external links as new-window links', async () => {
    const page = await renderMarkdown('[Preact](https://preactjs.com)')
    expect(page.html).toContain('target="_blank"')
    expect(page.html).toContain('rel="noopener noreferrer"')
  })

  it('rewrites local markdown links to clean routes when the target exists', async () => {
    const page = await renderMarkdown('[Intro](./guide/intro.md#setup)', undefined, {
      route: '/',
      routes: ['/', '/guide/intro']
    })

    expect(page.html).toContain('href="/guide/intro#setup"')
  })

  it('extracts mdx frontmatter and markdown headings without rendering jsx headings', () => {
    const page = extractMarkdownMetadata(`---
title: Counter demo
description: Interactive MDX page
---

import Counter from './Counter.tsx'

## Demo

<Counter initial={3} />

<h2>JSX heading</h2>

### Details
`)

    expect(page.title).toBe('Counter demo')
    expect(page.description).toBe('Interactive MDX page')
    expect(page.meta).toEqual({
      title: 'Counter demo',
      description: 'Interactive MDX page'
    })
    expect(page.headings).toEqual([
      { id: 'demo', text: 'Demo', level: 2 },
      { id: 'details', text: 'Details', level: 3 }
    ])
  })
})
