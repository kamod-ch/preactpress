---
title: Creating a custom PreactPress theme
description: Replace the default layout with your own Preact components and CSS tokens.
tags:
  - PreactPress
  - Themes
  - Preact
author: Klaus Zahiragic
category: Engineering
readTime: 10 min read
date: 2025-12-05
layout: doc
outline: true
---

# Creating a custom PreactPress theme

Point `theme` in config to a Preact layout component that receives `LayoutProps` from `@kamod-ch/preactpress/client`.

```ts
export default defineConfig({
  theme: "./theme/Layout.tsx",
});
```

## Layout responsibilities

Your layout typically renders:

- Header, footer, and mobile navigation
- Sidebar and outline from `themeConfig`
- MDX via `page.Component` when `page.kind === "mdx"`
- Markdown HTML via `page.content` for `.md` pages

## Design tokens

Reuse `--pp-*` CSS custom properties from the default theme for consistency, or define a prefixed token set like this blog starter's magazine-derived layout.

## Examples in the wild

- **Magazine** and **Blog** starters — editorial layouts with teaser grids
- **SaaS docs** starter — product landing plus documentation section
