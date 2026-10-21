---
title: Starter templates
description: Compare the built-in PreactPress init templates and choose the right starting shape.
---

# Starter templates

PreactPress ships **nine** official starters. Use `preactpress init` (or `pnpm dlx @kamod-ch/preactpress init`) and optionally `--template <name>` to scaffold one.

See the [template gallery on the home page](/#templates-title) for screenshots, **Open live demo** links, and copyable commands. Each starter (except the docs site itself) is also published under `/demos/<template>/` on GitHub Pages.

> Start with documentation, a technical blog, an API reference, SaaS docs, or a complete knowledge base—all powered by PreactPress.

## Which template should I use?

| Template           | CLI name                      | Theme               | Best for                        | Notable extras                                   |
| ------------------ | ----------------------------- | ------------------- | ------------------------------- | ------------------------------------------------ |
| Documentation      | `docs`                        | Default             | Full framework docs (this site) | Guides, examples, EN/DE locales                  |
| **Blog**           | `blog`                        | Custom engineering  | Technical blogs and changelogs  | RSS, tags, authors, reading time                 |
| **Product docs**   | `product-docs`                | Default + branding  | SDK / library documentation     | Install panel, version badge, changelog          |
| **API reference**  | `api-docs`                    | Custom Protocol     | REST + TypeScript SDK hybrid    | Protocol theme, OpenAPI plugin, ApiSignature MDX |
| **SaaS docs**      | `saas-docs`                   | Custom product      | SaaS onboarding and admin docs  | Workspace landing, role hints, integrations      |
| **Knowledge base** | `knowledge-base`              | Default + help home | Help centers and support        | Search-first home, categories, contact CTA       |
| Product + Docs     | `hono`                        | Custom              | Marketing site + docs area      | Landing layout, i18n demo                        |
| Magazine           | `magazine`                    | Custom editorial    | Editorial / magazine layouts    | Teaser grid, German demo content                 |
| Minimal            | `default` (omit `--template`) | Default             | Quick trials                    | Smallest file tree                               |

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

### Maintainers (PreactPress repository)

Live demos and gallery screenshots are produced from the monorepo:

```bash
pnpm run build:docs
pnpm run build:template-demos -- --pages-base /preactpress/   # match your GitHub Pages repo name
pnpm run capture:template-previews
```

If `templates/docs` fails to build after core changes, run `pnpm run link:templates/docs` from the repository root (see [Contributing on GitHub](https://github.com/kamod-ch/preactpress/blob/main/CONTRIBUTING.md#documentation-site-templatesdocs)).

## Customization

| Area                     | Where to edit                                                                   |
| ------------------------ | ------------------------------------------------------------------------------- |
| Site title & description | `site` in `.preactpress/config.ts`                                              |
| Navigation & sidebar     | `themeConfig.nav` / `themeConfig.sidebar`                                       |
| Colors & layout          | Default theme CSS variables (`--pp-*`) or custom theme in `.preactpress/theme/` |
| Branding assets          | `public/` and `themeConfig.logo`                                                |

## Comparison highlights

- **Blog** — Dark engineering header, featured post, RSS, tags, authors, and reading time.
- **Product docs** — SDK-branded default theme, install panel, version badge, changelog.
- **API docs** — Protocol-style custom theme; OpenAPI-generated REST resources plus SDK MDX helpers (`ApiSignature`, `ParameterTable`, `HttpMethodBadge`, `EndpointLine`).
- **SaaS docs** — Light product landing with workspace preview, setup paths, and admin role hints.
- **Knowledge base** — Search-first help-center home, category hubs, and support CTAs.

## Related

- [Getting started](/guide/getting-started)
- [CLI and validation](/guide/commands)
- [Custom themes](/guide/custom-themes)
- [RSS / Atom feed](/examples/rss)
