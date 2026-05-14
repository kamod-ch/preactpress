import { describe, expect, it, vi } from 'vitest'

vi.mock('shiki', () => ({
  createHighlighter: async () => ({
    codeToHtml: (code: string) => `<pre class="shiki"><code>${code}</code></pre>`
  })
}))

const { extractMarkdownMetadata, renderMarkdown } = await import('../src/node/markdown.js')

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
