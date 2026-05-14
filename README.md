# PreactPress

Static site generator using **Vite** and **Preact** (no Vue). Project layout is inspired by VitePress: Markdown and MDX pages, a `.preactpress` config directory, `dev` / `build` / `preview` commands, and an overridable theme `Layout`.

## Requirements

- Node 20+
- pnpm (recommended)

## Commands

From a site directory (with `.preactpress/config.ts` and Markdown next to `index.html`):

```bash
pnpm exec preactpress dev
pnpm exec preactpress build
pnpm exec preactpress preview
pnpm exec preactpress check
```

Scaffold a new site in the current folder:

```bash
pnpm exec preactpress init
pnpm install
pnpm exec preactpress dev
```

## Configuration

`preactpress/config` exports `defineConfig` (optional sugar). After `pnpm add -D preactpress`, you can use:

```ts
import { defineConfig } from 'preactpress/config'

export default defineConfig({
  site: { title: 'My docs', description: '…', base: '/' },
  srcDir: '.',
  outDir: 'dist',
  theme: './theme/Layout.tsx',
  themeConfig: {
    outline: true,
    search: true,
    footer: 'Released under MIT.',
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/acme/docs/edit/main/:path',
      text: 'Edit this page'
    },
    nav: [{ text: 'Home', link: '/' }],
    sidebar: [{ text: 'Guide', items: [{ text: 'Intro', link: '/' }] }]
  },
  markdown: {
    html: false,
    linkify: true,
    typographer: true
  },
  vite: {
    // merged into the internal Vite config
  },
  head: [
    ['meta', { name: 'theme-color', content: '#0f766e' }]
  ],
  build: {
    sitemap: true,
    robots: true
  }
})
```

The `init` template uses a plain `export default { ... }` object so it works before installing dependencies (Vite bundles the config file and must resolve imports).

Default theme lives in the `preactpress` package (`src/client/theme-default/Layout.tsx`). Point `theme` to a `.tsx` file that **default-exports** a Preact layout; props match `LayoutProps` in the package sources.

Markdown HTML is disabled by default. Enable `markdown.html` only for trusted content.
Set `site.url` to emit absolute canonical/OpenGraph URLs, `sitemap.xml`, and `robots.txt`.

`preactpress check` validates config loading, route collisions, the required root page, nav/sidebar links, and local Markdown links to `.md`, `.mdx`, and `.html` pages.

## MDX

Use `.md` for regular Markdown pages and `.mdx` when a page needs Preact components. MDX pages can import components directly:

```mdx
---
title: Counter demo
description: Interactive MDX page
---

import Counter from './components/Counter.tsx'

## Demo

<Counter initial={3} />
```

PreactPress reads MDX frontmatter for page metadata and extracts Markdown `##` / `###` headings for the outline.

## Monorepo

This repo lists `preactpress` in `pnpm-workspace.yaml`. Add `preactpress` as a devDependency (`workspace:*`) to consume the CLI from another package.

**Magazine starter** (`examples/magazine-starter/`): alternate layout (masthead, sticky nav, teaser grid in MDX, sidebar rail). From that directory run `pnpm install` and `pnpm exec preactpress dev`. The custom theme lives under `.preactpress/theme/` (see `theme/Layout.tsx` and `magazine.css`).

From this directory alone: `pnpm install`, `pnpm run build`, then `./bin/preactpress.mjs --help` (or `pnpm exec preactpress` when linked from a workspace).

## License

MIT (match repository root policy if different).
