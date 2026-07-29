---
title: Starter templates
description: Compare the built-in PreactPress init templates and choose the right starting shape.
---

# Starter templates

PreactPress ships **nine** official starters. Use `preactpress init` (or `pnpm dlx @kamod-ch/preactpress init`) and optionally `--template <name>` to scaffold one.

See the [template gallery on the home page](/#templates-title) for screenshots and copyable commands.

> Start with documentation, a technical blog, an API reference, SaaS docs, or a complete knowledge base—all powered by PreactPress.

## Which template should I use?

| Template           | CLI name                      | Theme            | Best for                        | Notable extras                                   |
| ------------------ | ----------------------------- | ---------------- | ------------------------------- | ------------------------------------------------ |
| Documentation      | `docs`                        | Default          | Full framework docs (this site) | Guides, examples, EN/DE locales                  |
| **Blog**           | `blog`                        | Custom editorial | Technical blogs and changelogs  | RSS, tags, authors, reading time                 |
| **Product docs**   | `product-docs`                | Default          | SDK / library documentation     | Concepts, FAQ, changelog, edit link              |
| **API reference**  | `api-docs`                    | Custom Protocol  | REST + TypeScript SDK hybrid    | Protocol theme, OpenAPI plugin, ApiSignature MDX |
| **SaaS docs**      | `saas-docs`                   | Custom product   | SaaS onboarding and admin docs  | Landing + docs, role hints, integrations         |
| **Knowledge base** | `knowledge-base`              | Default          | Help centers and support        | Search-first home, categories, contact CTA       |
| Product + Docs     | `hono`                        | Custom           | Marketing site + docs area      | Landing layout, i18n demo                        |
| Magazine           | `magazine`                    | Custom editorial | Editorial / magazine layouts    | Teaser grid, German demo content                 |
| Minimal            | `default` (omit `--template`) | Default          | Quick trials                    | Smallest file tree                               |

## Scaffold commands

```bash
# Documentation (canonical reference starter)
pnpm dlx @kamod-ch/preactpress init my-docs --template docs

# Technical blog with RSS
pnpm dlx @kamod-ch/preactpress init my-blog --template blog

# Product / library documentation
pnpm dlx @kamod-ch/preactpress init my-product --template product-docs

# API reference
pnpm dlx @kamod-ch/preactpress init my-api --template api-docs

# SaaS product documentation
pnpm dlx @kamod-ch/preactpress init my-saas --template saas-docs

# Help center / knowledge base
pnpm dlx @kamod-ch/preactpress init my-help --template knowledge-base

# Product landing + docs
pnpm dlx @kamod-ch/preactpress init my-site --template hono

# Editorial / magazine
pnpm dlx @kamod-ch/preactpress init my-mag --template magazine

# Minimal (default)
pnpm dlx @kamod-ch/preactpress init my-site
```

After scaffolding:

```bash
cd my-site
pnpm install
pnpm run dev
```

## Build and deploy

Every starter includes `pnpm run build` and `pnpm run preview`. Set `site.url` in `.preactpress/config.ts` before enabling sitemap, robots, or RSS (`build.feed` on the blog starter).

## Customization

| Area                     | Where to edit                                                                   |
| ------------------------ | ------------------------------------------------------------------------------- |
| Site title & description | `site` in `.preactpress/config.ts`                                              |
| Navigation & sidebar     | `themeConfig.nav` / `themeConfig.sidebar`                                       |
| Colors & layout          | Default theme CSS variables (`--pp-*`) or custom theme in `.preactpress/theme/` |
| Branding assets          | `public/` and `themeConfig.logo`                                                |

## Comparison highlights

- **Blog** — RSS feed, tag index, author listing, content-loader teasers, optional TOC on long posts.
- **Product docs** — hierarchical sidebar, version label in nav, troubleshooting and migration guides.
- **API docs** — Protocol-style custom theme; OpenAPI-generated REST resources plus SDK MDX helpers (`ApiSignature`, `ParameterTable`, `HttpMethodBadge`, `EndpointLine`).
- **SaaS docs** — product landing with multiple entry paths; step lists and screenshot placeholders.
- **Knowledge base** — help-center tone, popular searches, link-out to developer docs.

## Related

- [Getting started](/guide/getting-started)
- [CLI and validation](/guide/commands)
- [Custom themes](/guide/custom-themes)
- [RSS / Atom feed](/examples/rss)
