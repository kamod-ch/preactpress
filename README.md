# PreactPress

Static site generator using **Vite** and **Preact** (no Vue). Project layout is inspired by VitePress: Markdown pages, a `.preactpress` config directory, `dev` / `build` / `preview` commands, and an overridable theme `Layout`.

## Requirements

- Node 20+
- pnpm (recommended)

## Commands

From a site directory (with `.preactpress/config.ts` and Markdown next to `index.html`):

```bash
pnpm exec preactpress dev
pnpm exec preactpress build
pnpm exec preactpress preview
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
  }
})
```

The `init` template uses a plain `export default { ... }` object so it works before installing dependencies (Vite bundles the config file and must resolve imports).

Default theme lives in the `preactpress` package (`src/client/theme-default/Layout.tsx`). Point `theme` to a `.tsx` file that **default-exports** a Preact layout; props match `LayoutProps` in the package sources.

Markdown HTML is disabled by default. Enable `markdown.html` only for trusted content.

## Monorepo

This repo lists `preactpress` in `pnpm-workspace.yaml`. Add `preactpress` as a devDependency (`workspace:*`) to consume the CLI from another package.

From this directory alone: `pnpm install`, `pnpm run build`, then `./bin/preactpress.mjs --help` (or `pnpm exec preactpress` when linked from a workspace).

## License

MIT (match repository root policy if different).
