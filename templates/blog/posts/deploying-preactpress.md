---
title: Deploying a PreactPress site
description: Ship static HTML to any CDN — set site.url, build, and upload dist/.
tags:
  - PreactPress
  - Deploy
  - DevOps
author: Alex Chen
category: Guides
readTime: 5 min read
date: 2026-01-22
layout: doc
---

# Deploying a PreactPress site

Production builds emit static HTML, assets, `sitemap.xml`, and optional `feed.xml`.

## Configure the canonical URL

```ts
export default defineConfig({
  site: {
    url: "https://docs.example.com",
  },
  build: {
    sitemap: true,
    robots: true,
  },
});
```

## Build locally

```bash
pnpm run build
pnpm run preview
```

Upload the `dist/` folder to Cloudflare Pages, Netlify, GitHub Pages, or any static host.

::: warning
Always set `site.url` before enabling sitemap, robots, or RSS — relative URLs break feed readers.
:::
