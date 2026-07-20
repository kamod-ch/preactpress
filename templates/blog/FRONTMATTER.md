# Article frontmatter reference

Use YAML frontmatter at the top of each file in `posts/`.

| Field         | Type                      | Required    | Description                                           |
| ------------- | ------------------------- | ----------- | ----------------------------------------------------- |
| `title`       | string                    | yes         | Article title                                         |
| `description` | string                    | recommended | SEO summary and social cards                          |
| `tags`        | string[]                  | optional    | Tag index pages (`/tags/<slug>`)                      |
| `author`      | string                    | optional    | Display name; link from `/authors`                    |
| `category`    | string                    | optional    | Editorial category label                              |
| `readTime`    | string                    | optional    | e.g. `6 min read`                                     |
| `date`        | string (ISO date)         | recommended | Publication date; sorts home teasers                  |
| `lastUpdated` | ISO datetime              | optional    | Shown when `lastUpdated: true` in config; used in RSS |
| `image`       | string (URL)              | optional    | Open Graph / social preview image                     |
| `layout`      | `doc` \| `page` \| `home` | optional    | Page chrome (default: doc for posts)                  |
| `outline`     | boolean                   | optional    | Table of contents for long articles                   |

## Example

```yaml
---
title: Introducing PreactPress
description: Why we built a documentation platform for Preact.
tags:
  - PreactPress
  - Announcement
author: Klaus Zahiragic
category: Product
readTime: 6 min read
date: 2026-03-10
lastUpdated: 2026-03-12T09:00:00.000Z
image: /og/introducing-preactpress.svg
layout: doc
outline: true
---
```
