---
title: Welcome
description: Vite + Preact static site
---

# Welcome

This site is generated with **PreactPress**, a tiny Vite and Preact static site generator for documentation-style sites.

## Start editing

Edit `index.md` for this page, add more pages as `*.md` files, use `*.mdx` for pages with Preact components, and configure navigation in `.preactpress/config.ts`.

```ts
export default {
  site: { title: 'My site' },
  themeConfig: {
    nav: [{ text: 'Home', link: '/' }]
  }
}
```

## What you get

| Feature | Included |
| --- | --- |
| Static HTML build | Yes |
| Client navigation | Yes |
| Markdown frontmatter | Yes |
| MDX with Preact components | Yes |
| Code highlighting | Yes |

> The default theme is intentionally small, so you can replace it with your own Preact layout when your site grows.
