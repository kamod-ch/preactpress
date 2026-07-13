---
title: Starter templates
description: Compare the built-in PreactPress init templates and choose the right starting shape.
---

# Starter templates

PreactPress ships four official starters. Use `preactpress init` (or `pnpm dlx @kamod-ch/preactpress init`) and optionally `--template <name>` to scaffold one.

See the [template gallery on the home page](/#templates-title) for screenshots and copyable commands.

## Which template should I use?

| Template | CLI name | Theme | Best for | Notable extras |
| -------- | -------- | ----- | -------- | -------------- |
| Documentation | `docs` | Default docs theme | Full product or library docs (this site) | Guides, examples, search, EN/DE locales |
| Product + Docs | `hono` | Custom Preact theme | Product marketing page plus a docs area | Landing layout, focused guide subset, i18n demo |
| Magazine | `magazine` | Custom editorial theme | Articles, tags, content-heavy sites | Teaser grid, tag pages, content loader |
| Minimal | `default` (omit `--template`) | Default docs theme | Trying PreactPress quickly | Smallest file tree |

## Scaffold commands

```bash
# Documentation (canonical reference starter)
pnpm dlx @kamod-ch/preactpress init my-docs --template docs

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

## How they differ

- **Documentation** is the largest starter and the public demo. Prefer it when you want the full guide surface, examples, and default theme features out of the box.
- **Product + Docs** shows how far a custom theme can go for a marketing site while keeping a documentation section. Use it as a theme reference more than as the canonical API docs source.
- **Magazine** focuses on editorial patterns: article teasers, tags, and a content-loader driven home page.
- **Minimal** is the default `init` target. Start here if you want the fewest files and will grow the site yourself.

## Related

- [Getting started](/guide/getting-started)
- [CLI and validation](/guide/commands)
- [Custom themes](/guide/custom-themes)
- [Custom theme example](/examples/custom-theme)
