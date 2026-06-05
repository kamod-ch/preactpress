<p align="center">
  <img src="./assets/logo.svg" alt="preactpress" width="420" />
</p>

# PreactPress

**PreactPress** is a static site generator: you write pages in **Markdown** (or **MDX** with Preact components), configure navigation and theme, and get static HTML for Netlify, Vercel, GitHub Pages, and similar hosts — **no Node server in production**.

Built with **Vite** and **Preact**. Project layout is inspired by [VitePress](https://vitepress.dev/), but without Vue.

## Table of contents

- [Who is it for?](#who-is-it-for)
- [Quick start](#quick-start)
- [Starter templates](#starter-templates)
- [Project structure](#project-structure)
- [Your first 5 minutes](#your-first-5-minutes)
- [Commands](#commands)
- [Key concepts](#key-concepts)
- [Configuration](#configuration)
- [Page frontmatter](#page-frontmatter)
- [MDX](#mdx)
- [Tags and URLs](#tags-and-urls)
- [Internationalization](#internationalization)
- [Custom theme](#custom-theme)
- [Deploying your site](#deploying-your-site)
- [Advanced](#advanced)
- [Contributing](#contributing)
- [License](#license)

## Who is it for?

PreactPress fits documentation sites, blogs, portfolios, and marketing pages where content lives in Markdown files and you want fast dev tooling with optional interactive Preact components.

| If you know… | PreactPress is… |
| --- | --- |
| [VitePress](https://vitepress.dev/) | Similar workflow, but with **Preact** instead of Vue |
| Next.js / Nuxt | **Static export only** — no server runtime in production |
| Jekyll / Hugo | Markdown-first, but powered by **Vite** and **MDX** |

## Quick start

**Requirements:** Node 20+, [pnpm](https://pnpm.io/) recommended (npm/yarn also work).

```bash
mkdir my-site && cd my-site
pnpm dlx preactpress init    # or: npx preactpress init
pnpm install
pnpm run dev
```

`init` scaffolds the site and writes `preactpress` as a devDependency in `package.json` — no separate `pnpm add` needed.

Open **http://localhost:5173** — you should see a minimal starter site with a home page, an about page, search, and a **Your first 5 minutes** guide. A small **`README.md`** in the scaffold lists project-specific commands and edit paths.

Try the bundled demo from the package repo (the same `templates/default/` site, dogfooding PreactPress):

```bash
git clone <repo-url>
cd preactpress
pnpm install
pnpm run dev     # dev server for ./templates/default
```

## Starter templates

`preactpress init` defaults to the smallest useful site. Use an optional template when you want a fuller starting point:

```bash
pnpm dlx preactpress init my-docs --template docs
pnpm dlx preactpress init my-magazine --template magazine
```

| Template | Purpose |
| --- | --- |
| `default` | Minimal single-language site for blogs, portfolios, and small docs |
| `docs` | Larger documentation starter with MDX and an i18n demo |
| `magazine` | Custom-theme starter with a masthead, sticky nav, and MDX teaser grid |

The official website and larger examples live in the separate [`preactpress-examples`](../preactpress-examples) project.

## Project structure

After `preactpress init`, your site looks like this:

```text
my-site/
├── README.md               # Commands and edit paths for this project
├── index.html              # Vite entry (rarely edited)
├── index.md                # Home page → /
├── about.md                # → /about (from the 5-minute tutorial)
├── guide/
│   └── first-five-minutes.md   # → /guide/first-five-minutes
└── .preactpress/
    └── config.ts           # Site title, nav, sidebar, build options
```

**Every `.md` or `.mdx` file under `srcDir` (default: project root) becomes a URL automatically.**  
Example: `news/2025/intro.md` → `/news/2025/intro`.

## Your first 5 minutes

### 1. Change the site title

Edit `.preactpress/config.ts`:

```ts
export default {
  site: {
    title: 'My Docs',
    description: 'Short summary for search and social previews'
  }
}
```

### 2. Add a page

Create `about.md`:

```md
---
title: About
description: About this site
---

# About us

Your content here.
```

PreactPress serves it at `/about`.

### 3. Add it to the navigation

In `.preactpress/config.ts`:

```ts
export default {
  site: { title: 'My Docs' },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Home', link: '/' },
          { text: 'About', link: '/about' }
        ]
      }
    ]
  }
}
```

Save — the dev server hot-reloads your changes.

## Commands

From a site directory (with `.preactpress/config.ts` and Markdown next to `index.html`):

| Command | Purpose |
| --- | --- |
| `pnpm exec preactpress dev` | Dev server with SSR and hot reload |
| `pnpm exec preactpress build` | Static production build → `dist/` |
| `pnpm exec preactpress preview` | Local preview of the build (not for production hosting) |
| `pnpm exec preactpress check` | Validate config, links, and routes before release |
| `pnpm exec preactpress init` | Scaffold a new site in the current folder |
| `pnpm exec preactpress init --template docs` | Scaffold the larger docs starter |

The `init` template also ships npm scripts: `pnpm run dev`, `check`, `build`, `preview`.

## Key concepts

| Term | Meaning |
| --- | --- |
| `srcDir` | Directory containing Markdown/MDX pages (default: `.`) |
| `outDir` | Build output to deploy (default: `dist/`) |
| `theme` | Preact layout component (header, sidebar, page shell) |
| `themeConfig` | Logo, nav, sidebar, search (local or Algolia), socialLinks, footer — no theme code required |
| `site.base` | Public URL prefix (e.g. `/repo/` for GitHub Pages project sites) |
| `site.url` | Canonical site URL for SEO, sitemap, and Open Graph |

## Configuration

The starter uses a plain config object so it works before dependencies are installed. After `pnpm add -D preactpress`, you can optionally use `defineConfig`:

```ts
import { defineConfig } from 'preactpress/config'

export default defineConfig({
  site: { title: 'My docs', description: '…', base: '/' },
  srcDir: '.',
  outDir: 'dist',
  themeConfig: {
    logo: '/logo.svg',
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

Common options:

- **`site.titleTemplate`** — default `:title | :siteTitle`; set `false` on a page via frontmatter for a bare title.
- **`srcExclude`** — glob patterns for Markdown that should not become routes (e.g. `['**/README.md']`).
- **`lastUpdatedGit`** — use git commit timestamps when `themeConfig.lastUpdated` is enabled.
- **`themeConfig.sidebar`** — flat array or path map `{ '/guide/': [...] }`; supports nested items and `collapsed` groups.
- **`themeConfig.nav`** — supports nested dropdown items via `items`.
- **`themeConfig.logo`** — string URL or `{ light, dark }` for theme-aware logos.
- **`themeConfig.labels`** — override default-theme UI strings (merged with EN/DE defaults).
- **`rewrites`** — map public routes to existing content, e.g. `{ '/docs': '/guide' }`.
- **`cleanUrls`** — default `true` (`path/index.html`); set `false` for `path.html` output.
- **`markdown.emoji`** / **`markdown.math`** — opt-in `:rocket:` shortcodes and `$…$` / `$$…$$` MathJax.
- **`markdown.html`** — disabled by default; enable only for trusted content.
- **`site.url`** — set before production to emit canonical/Open Graph URLs, `sitemap.xml`, and `robots.txt`.
- **`preactpress check`** — validates config loading, route collisions, the root page, nav/sidebar links, local Markdown links, and tag routes. Warns about missing descriptions and draft pages.

In development, each route is served as HTML with meta tags and SSR content in `#app` (same SEO shape as production). Theme CSS is injected in the document head so the first paint matches production.

## Page frontmatter

Optional YAML at the top of each `.md` / `.mdx` file:

| Field | Purpose |
| --- | --- |
| `title` | Page title (nav, `<title>`, search) |
| `description` | Summary for SEO and search |
| `tags` / `tag` | Tag indexes at `/tags/<slug>` (see below) |
| `image` / `ogImage` | Social preview image |
| `type: article` | Article metadata |
| `layout: doc` | Default theme shell with sidebar, outline, and previous/next links |
| `layout: home` | Wide default-theme shell for landing pages; supports `hero` and `features` |
| `layout: page` | Default-theme content page without sidebar, outline, pager, or prose styles |
| `hero` | Home-page hero (`name`, `text`, `tagline`, `image`, `actions`) |
| `features` | Home-page feature cards (`icon`, `title`, `details`, optional `link`) |
| `navbar: false` | Hide the top navigation for this page |
| `sidebar: false` / `sidebar: true` | Override the default sidebar visibility for this page |
| `aside: false` / `aside: left` | Hide the page outline or move it to the left |
| `outline` | Override outline levels: `false`, a number, `[min, max]`, or `deep` |
| `footer: false` | Hide the configured site footer for this page |
| `editLink: false` | Hide the configured edit link for this page |
| `lastUpdated: false` | Hide the last-updated timestamp for this page |
| `titleTemplate` | Override `site.titleTemplate` (`:title \| :siteTitle`); `false` uses the raw page title |
| `head` | Per-page `<meta>` / `<link>` / `<script>` tags (same tuple format as config `head`) |

Markdown extras (no frontmatter needed): `::: tip` containers, `> [!NOTE]` alerts, `[[toc]]`, `::: code-group`, `<!--@include: path-->`, `<<< @/file` snippets, `{#id}` heading anchors, `{2}` / `[!code highlight]` line markers.
| `pageClass` | Add an extra class to the page `<article>` |
| `isHome: true` | Treat a custom page as home-like in the default theme |
| `markdownStyles: false` | Disable default prose styles for `layout: home` content |
| `draft: true` | Excluded from routes, search, feeds, and sitemap; `check` warns |

Example home page:

```md
---
layout: home
hero:
  name: PreactPress
  text: Vite and Preact powered static sites
  tagline: Write Markdown and MDX, then ship static HTML.
  actions:
    - theme: brand
      text: Get started
      link: /guide/first-five-minutes
features:
  - icon: V
    title: Fast by default
    details: Built on Vite with static HTML output.
---
```

## MDX

Use `.md` for regular Markdown. Use `.mdx` when a page needs Preact components:

```mdx
---
title: Counter demo
description: Interactive MDX page
---

import Counter from './components/Counter.tsx'

## Demo

<Counter initial={3} />
```

PreactPress reads MDX frontmatter for page metadata and extracts `##` / `###` headings for the on-page outline.

## Tags and URLs

Page URLs follow file paths under `srcDir`. Tags in frontmatter do **not** change a page's own URL.

Each distinct tag gets an auto-generated index at **`/tags/<slug>`** (lowercase, hyphenated). The index lists every page with that tag. If a real page already exists at the same route (e.g. `tags/react.md` → `/tags/react`), that file wins.

The default theme shows tags as linked chips below the page lead. Disable with `themeConfig.tags: false`.

Tag indexes are included in static output, `preactpress-search.json`, and `sitemap.xml` (when configured).

## Internationalization

PreactPress supports VitePress-style locale folders. Keep the default language at the root, and add translated content under a locale folder:

```text
docs/
├── index.md              # English → /
├── guide/intro.md        # English → /guide/intro
└── de/
    ├── index.md          # German → /de
    └── guide/intro.md    # German → /de/guide/intro
```

Configure labels, language codes, and locale-specific navigation in `.preactpress/config.ts`:

```ts
export default {
  site: {
    title: 'PreactPress',
    description: 'Vite + Preact static site generator'
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [{ text: 'Guide', link: '/guide/intro' }]
      }
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      link: '/de/',
      description: 'Vite + Preact Static-Site-Generator',
      themeConfig: {
        nav: [{ text: 'Anleitung', link: '/de/guide/intro' }]
      }
    }
  }
}
```

The default theme shows a language switcher when multiple locales are configured. Static output uses the matching `<html lang>`, locale-scoped search results, locale-scoped tag pages such as `/de/tags/markdown`, and `hreflang` alternates when `site.url` is set.

PreactPress does not redirect `/` based on `Accept-Language`; configure redirects at your host if you want automatic language selection.

## Custom theme

The default theme ships inside the `preactpress` package. Point `theme` to a `.tsx` file that **default-exports** a Preact layout:

```ts
export default {
  theme: './theme/Layout.tsx'
}
```

Props match `LayoutProps` in the package. Theme authors can import helpers from `preactpress/client` and `preactpress/shared`, including `LayoutProps`, `PageView`, `usePageHead`, `normalizeRoute`, and tag/slug utilities.

See the separate [`preactpress-examples`](../preactpress-examples) project for custom layouts, including a magazine-style starter with a masthead, sticky nav, and teaser grid.

## Deploying your site

PreactPress is a **static site generator**. Production means `preactpress build` and uploading **`outDir`** (default `dist/`). No Node server required.

```bash
pnpm install
pnpm exec preactpress check    # recommended before release
pnpm exec preactpress build
pnpm exec preactpress preview  # optional local smoke test
```

Upload **only `dist/`** to Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 + CDN, or any static file server.

### Production configuration

```ts
export default {
  site: {
    title: 'My site',
    description: '…',
    url: 'https://example.com', // canonical, Open Graph, sitemap, robots
    base: '/'                   // see subpath hosting below
  },
  outDir: 'dist',
  build: {
    sitemap: true,
    robots: true
  }
}
```

Override `site.base` for one build without editing config:

```bash
pnpm exec preactpress build --base /my-repo/
```

### Build output

| Output | Description |
| --- | --- |
| `index.html`, `*/index.html` | One HTML file per route |
| Hashed JS/CSS | Client bundle from Vite |
| `404.html` | Not-found page |
| `preactpress-search.json` | Search index for the default theme |
| `preactpress-content/*.json` | Lazy-loaded Markdown payloads for client navigation |
| `sitemap.xml`, `robots.txt` | When `site.url` is set and build flags are enabled |

Deploy **`outDir` only** — not `cacheDir` (default `node_modules/.preactpress`).

### Subpath hosting (GitHub Pages)

For `https://user.github.io/repo/`:

```ts
site: {
  base: '/repo/',
  url: 'https://user.github.io'
}
```

Build and deploy `dist/` as the site root on the host.

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
# Upload or deploy dist/
```

In a monorepo, run from the site package directory or pass a path: `preactpress build ./path/to/site`.

## Advanced

**RSS feed** — when `site.url` is set:

```ts
build: {
  feed: { limit: 20 }
}
```

Emits `feed.xml` alongside the static build.

**Content Security Policy** — PreactPress avoids executable inline boot scripts. Theme bootstrap runs from `preactpress-theme.js`; hydration data lives in a non-executable `<template>` so stricter CSPs do not need `script-src 'unsafe-inline'` for core runtime behavior.

**Incremental builds** — repeated builds cache route artifacts in `build-manifest.json` under `cacheDir`.

**Markdown bundle strategy** — MDX loaders stay in the client bundle; Markdown HTML is fetched from `preactpress-content/*.json` on navigation, keeping large sites from shipping every page body upfront.

## Contributing

To work on the PreactPress CLI, run demos, or publish the npm package, see **[CONTRIBUTING.md](./CONTRIBUTING.md)**. Planned features are tracked in **[ROADMAP.md](./ROADMAP.md)**.

## License

MIT (match repository root policy if different).
