---
title: Building documentation with Preact and Markdown
description: Structure guides, reference pages, and examples with frontmatter-driven navigation.
tags:
  - PreactPress
  - Markdown
  - Documentation
author: Alex Chen
category: Guides
readTime: 8 min read
date: 2026-02-18
image: /og/building-documentation.svg
layout: doc
outline: true
---

# Building documentation with Preact and Markdown

Great docs start with predictable information architecture. PreactPress maps files to routes and lets you configure sidebars in `.preactpress/config.ts`.

## Frontmatter essentials

| Field         | Purpose                             |
| ------------- | ----------------------------------- |
| `title`       | Page title and search index entry   |
| `description` | SEO summary and social cards        |
| `tags`        | Tag index pages and related content |
| `layout`      | `home`, `page`, or `doc` chrome     |

## Callouts and code

Use fenced code blocks with language tags. PreactPress highlights TypeScript, bash, and more via Shiki.

::: tip
Keep reference pages scannable — short paragraphs, tables, and deep-linkable headings.
:::

## Related posts

- [Deploying a PreactPress site](/posts/deploying-preactpress)
- [Creating a custom PreactPress theme](/posts/custom-preactpress-theme)
