<p align="center">
  <img src="./assets/logo.svg" alt="preactpress" width="420" />
</p>

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

`preactpress dev` serves per-route HTML with meta tags and SSR content in `#app` (same SEO shape as production). Theme stylesheets from the client module graph are injected as `<link rel="stylesheet">` in the document head so the first paint matches production (no flash of unstyled content while the JS bundle loads). Set `site.description` and optional per-page `description` frontmatter for summaries; `preactpress check` warns when both are missing.

`preactpress check` validates config loading, route collisions, the required root page, nav/sidebar links, local Markdown links to `.md`, `.mdx`, and `.html` pages, and routes generated from frontmatter tags.

## Tags and URLs

Normal page URLs still follow your content file paths (for example `news/2025/intro.md` becomes `/news/2025/intro`). For a **main** and **secondary** segment in the path, use nested folders under `srcDir`.

Optional frontmatter fields **`tags`** (array of strings) and **`tag`** (single string) do not change a page’s own URL, but each distinct tag gets an auto-generated index at **`/tags/<slug>`**, where `<slug>` is a lowercase, hyphenated form of the tag. The index lists every Markdown or MDX page that lists that tag. If a real page already exists at the same route (for example `tags/react.md` → `/tags/react`), that file takes precedence and no synthetic tag index is emitted for that slug.

Tag index routes are included in static output, `preactpress-search.json`, and `sitemap.xml` (when configured) alongside file-based routes.

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

## Production

PreactPress is a **static site generator**. Production means running `preactpress build` and deploying the output folder (default `dist/`). There is no Node server required in production.

### Deploying a site

From your site directory (with `.preactpress/config.ts`):

```bash
pnpm install
pnpm exec preactpress check    # recommended before release
pnpm exec preactpress build
pnpm exec preactpress preview  # optional: local smoke test only
```

Or use the npm scripts from the `init` template:

```bash
pnpm run check
pnpm run build
pnpm run preview
```

Upload **only the contents of `outDir`** (default `dist/`) to any static host, for example Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 + CDN, or nginx/Caddy as a static file server.

`preactpress preview` starts a small local static server (`sirv`) for testing the build. It is not intended as a long-running production server.

### Production configuration

Set these in `.preactpress/config.ts` before a production build:

```ts
export default {
  site: {
    title: 'My site',
    description: '…',
    url: 'https://example.com', // canonical, Open Graph, sitemap, robots
    base: '/'                   // see “Subpath hosting” below
  },
  outDir: 'dist',
  build: {
    sitemap: true,
    robots: true
  }
}
```

- **`site.url`** — required for absolute canonical and Open Graph URLs, plus `sitemap.xml` and `robots.txt` (when `build.sitemap` / `build.robots` are enabled).
- **`site.base`** — public path prefix (Vite `base`). Use `/` for apex domains; use a subpath for project sites on GitHub Pages (see below).
- **`outDir`** — build output directory to deploy (default `dist`).

Override `site.base` for a single build without editing config:

```bash
pnpm exec preactpress build --base /my-repo/
```

CLI options for preview: `--port`, `--host`, `--base`.

### Build output

`preactpress build` runs SSR for every route and writes static HTML plus client assets:

| Output | Description |
|--------|-------------|
| `index.html`, `*/index.html` | One HTML file per route (e.g. `/about` → `about/index.html`) |
| Hashed JS/CSS | Client bundle from Vite |
| `404.html` | Not-found page |
| `preactpress-search.json` | Route list for theme search |
| `sitemap.xml`, `robots.txt` | Emitted when `site.url` is set and `build.sitemap` / `build.robots` are enabled |

Intermediate build artifacts go to `cacheDir` (default `node_modules/.preactpress`); deploy **`outDir` only**.

### Subpath hosting (e.g. GitHub Pages)

For a project site at `https://user.github.io/repo/`:

```ts
site: {
  base: '/repo/',
  url: 'https://user.github.io'
}
```

Build and deploy `dist/` as the site root on the host (Pages serves from the repo’s configured branch/folder).

### CI example

```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: pnpm
- run: pnpm install
- run: pnpm exec preactpress check
- run: pnpm exec preactpress build
# Upload or deploy the dist/ directory (adjust path if outDir differs)
```

In a monorepo, run these steps from the site package directory (or pass the site root: `preactpress build ./path/to/site`).

### Publishing the `preactpress` package (npm)

To release the **CLI/tool** itself (not a content site), from the `preactpress` package directory:

```bash
pnpm install
pnpm run build   # compiles TypeScript to dist/
pnpm publish     # runs prepack → build automatically
```

Requirements: Node 20+, npm account, and the `files` field in `package.json` (includes `dist`, `bin`, `template`, etc.).

## Monorepo

This repo lists `preactpress` in `pnpm-workspace.yaml`. Add `preactpress` as a devDependency (`workspace:*`) to consume the CLI from another package.

**Magazine starter** (`examples/magazine-starter/`): alternate layout (masthead, sticky nav, teaser grid in MDX, sidebar rail). From that directory run `pnpm install` and `pnpm exec preactpress dev`. The custom theme lives under `.preactpress/theme/` (see `theme/Layout.tsx` and `magazine.css`).

### Working on the `preactpress` package

From the **package root** (`preactpress/`, where this README lives), two different “build” concepts apply:

| Command | What it builds |
|---------|----------------|
| `pnpm run build` | Compiles the **CLI** TypeScript sources to `dist/` (`tsc`). Does **not** build a content site. |
| `pnpm exec preactpress build [root]` | Runs the **static site generator** for a site (default: current directory). Writes HTML + assets to `outDir` (e.g. `template/dist/`). |

After changing CLI or client code, run `pnpm run build` before `pnpm run demo` or `node ./bin/preactpress.mjs …` so `dist/` is up to date.

### Bundled demos (package root)

These scripts target the bundled starter sites without passing a path each time:

| Script | What it does |
|--------|----------------|
| `pnpm run demo` | **Dev** server for `./template` — Vite + SSR, HMR |
| `pnpm run demo:preview` | **Production** build + static preview for `./template` |
| `pnpm run demo:magazine` | **Dev** server for `examples/magazine-starter` |
| `pnpm run demo:magazine:preview` | **Production** build + preview for the magazine example |

Typical workflows:

```bash
# Hack on the CLI / default theme (dev, hot reload)
pnpm install
pnpm run build          # compile CLI → dist/
pnpm run demo           # http://localhost:5173 (template site)

# Smoke-test production output for the template
pnpm run demo:preview   # preactpress build template && preactpress preview template

# Magazine example (custom theme under .preactpress/theme/)
pnpm run demo:magazine
pnpm run demo:magazine:preview
```

Equivalent explicit CLI invocations:

```bash
node ./bin/preactpress.mjs dev template
node ./bin/preactpress.mjs build template && node ./bin/preactpress.mjs preview template
```

### Dev vs production styling

In **development**, PreactPress SSR still renders the full layout into `#app`, but theme CSS normally lives in the client bundle (`import './styles.css'` in your `Layout.tsx`). Without extra handling, the browser would paint unstyled HTML until the module script runs.

PreactPress avoids that by collecting stylesheet URLs from the Vite client module graph (`preactpress/app` → layout → CSS) and injecting `<link rel="stylesheet">` tags into each dev HTML response (see `src/node/devCss.ts`).

In **production**, `preactpress build` extracts CSS into hashed files and `pageHtml` emits the same `<link rel="stylesheet">` tags in the static HTML head — the same shape as dev SSR for SEO and first paint.

A small inline script in the head restores `data-theme` from `localStorage` before paint when the user chose light/dark explicitly (`preactpress-theme`).

From this directory alone: `pnpm install`, `pnpm run build`, then `./bin/preactpress.mjs --help` (or `pnpm exec preactpress` when linked from a workspace).

## License

MIT (match repository root policy if different).
