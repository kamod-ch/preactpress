---
title: Welcome
description: Get started with PreactPress in minutes
layout: home
hero:
  name: PreactPress
  text: Vite and Preact powered static sites
  tagline: Write Markdown and MDX, configure navigation, and ship a small static documentation site.
  actions:
    - theme: brand
      text: Get started
      link: /guide/first-five-minutes
    - theme: alt
      text: About this site
      link: /about
features:
  - icon: V
    title: Fast by default
    details: Static HTML output, Vite dev server, and optional client navigation.
  - icon: M
    title: Markdown first
    details: Frontmatter, MDX, tags, search metadata, and outline extraction.
  - icon: T
    title: Themeable
    details: Use the default theme or replace it with your own Preact layout.
---

## Quick start

From this folder:

```bash
pnpm install
pnpm run dev
```

Open **http://localhost:5173**. Edit Markdown files, adjust `.preactpress/config.ts`, and the dev server hot-reloads your changes.

## What to read next

| Page                                              | Why                                              |
| ------------------------------------------------- | ------------------------------------------------ |
| [Your first 5 minutes](/guide/first-five-minutes) | Change the title, add a page, wire up navigation |
| [About](/about)                                   | A plain content page you can replace             |

## What you get

| Feature              | Included |
| -------------------- | -------- |
| Static HTML build    | Yes      |
| Client navigation    | Yes      |
| Markdown frontmatter | Yes      |
| Sidebar search       | Yes      |

The default template is intentionally small. Use `preactpress init --template docs` when you want a fuller documentation starter, or `preactpress init --template magazine` for a custom-theme example.
