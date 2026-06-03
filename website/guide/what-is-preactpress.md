---
title: What is PreactPress?
description: Learn what PreactPress is and when to use it
---

# What is PreactPress?

PreactPress is a static site generator for fast, content-focused websites. You write pages in Markdown or MDX, configure navigation and theme options in `.preactpress/config.ts`, and PreactPress generates static HTML that can be deployed to any static host.

It is built with [Vite](https://vite.dev/) and [Preact](https://preactjs.com/). The workflow is inspired by VitePress, but the component model is Preact instead of Vue.

## Use cases

### Documentation

PreactPress ships with a small default theme for technical documentation. It includes navigation, sidebar groups, outline links, search, last-updated metadata, and Markdown rendering out of the box.

Use it when your docs live naturally as files:

```text
index.md
guide/getting-started.md
guide/routing.md
reference/api.md
```

Every Markdown or MDX file becomes a page, so documentation grows by adding files and linking them from the sidebar.

### Blogs, portfolios, and marketing sites

PreactPress can also power blogs, portfolios, and small marketing sites. Markdown handles content, MDX brings in interactive Preact components, and custom themes let you replace the default documentation shell.

The package includes a custom-theme example in `examples/magazine-starter/` that shows a magazine-style layout with article teasers and tag pages.

## Developer experience

PreactPress focuses on keeping content work simple:

| Feature | What it gives you |
| --- | --- |
| Vite dev server | Fast startup and hot updates while editing content |
| Markdown frontmatter | Page titles, descriptions, tags, draft status, and social metadata |
| MDX | Preact components inside content pages |
| Default theme | Nav, sidebar, outline, search, footer, locale switcher |
| `preactpress check` | Config, route, and link validation before release |

For regular content, use `.md`. When a page needs interactivity, use `.mdx` and import a Preact component:

```mdx
import Counter from './components/Counter.tsx'

## Demo

<Counter initial={3} />
```

## Performance

PreactPress produces static HTML for every route during the production build. The first visit receives HTML that already contains the page content, which is good for loading speed and SEO.

After hydration, client-side navigation takes over. Markdown pages are loaded as small JSON payloads from `preactpress-content/*.json`, so large sites do not need to ship every Markdown body in the initial JavaScript bundle.

The production output is static files only:

| Output | Purpose |
| --- | --- |
| `index.html`, `*/index.html` | One HTML file per route |
| `assets/*` | Hashed JavaScript and CSS from Vite |
| `preactpress-search.json` | Search data for the default theme |
| `preactpress-content/*.json` | Lazy-loaded Markdown page payloads |
| `404.html` | Not-found page |

## What about VitePress?

If you know VitePress, PreactPress should feel familiar: both use Vite, file-based Markdown routing, a default docs theme, and static output.

The main difference is the UI stack. VitePress uses Vue. PreactPress uses Preact and MDX, so interactive content and custom themes are written as Preact components.

PreactPress is also static-only in production. You build the site once, upload the output directory, and serve it from Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, Nginx, or another static host.

## Next steps

| Page | Why |
| --- | --- |
| [Getting Started](/guide/getting-started) | Install PreactPress and understand the starter structure |
| [Routing](/guide/routing) | Learn how files become URLs |
| [Deploy](/guide/deploy) | Build and publish a static site |
