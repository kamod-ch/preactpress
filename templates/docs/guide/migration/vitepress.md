---
title: Migrate from VitePress
description: Use the migration assistant to move VitePress documentation sites to PreactPress.
---

PreactPress includes a migration assistant for VitePress projects. Future adapters for Docusaurus and Starlight are planned.

```bash
preactpress migrate vitepress --source ./docs
preactpress migrate vitepress --dry-run
preactpress migrate vitepress --output ./preactpress-docs
```

## What gets migrated automatically

| Area                 | Behavior                                                           |
| -------------------- | ------------------------------------------------------------------ |
| Markdown pages       | Copied to the output root with link cleanup (`.md` → clean routes) |
| Frontmatter          | Preserved; VitePress-only keys flagged for review                  |
| Navigation / sidebar | Mapped into `.preactpress/config.ts` `themeConfig`                 |
| Theme config         | Social links, footer, search flags, and outline settings           |
| Code groups          | `::: code-group` blocks kept as-is (PreactPress compatible)        |
| Custom containers    | `::: tip`, `::: warning`, `::: danger`, `::: info`, `::: details`  |
| Public assets        | Copied to `public/`                                                |
| Head metadata        | Mapped to `head` in config                                         |
| Sitemap hostname     | Mapped to `site.url` and `build.sitemap`                           |
| i18n                 | `locales` block mapped when present                                |

## Safety guarantees

- **Source files are never modified** — output goes to a separate directory (default `./preactpress-docs`).
- **Existing output is not overwritten** — re-running migration skips files that already exist.
- **`--dry-run`** — analyze the project and print a report without writing files.

## Migration report

Every run prints a report with:

- automatically migrated items
- warnings (for example Vue components in Markdown)
- manual follow-up tasks (Vue → Preact porting hints)

Use `--format json` or `--report migration-report.json` for machine-readable output.

## Vue → Preact porting

VitePress relies on Vue SFCs and markdown `<script setup>` blocks. PreactPress uses **Preact + MDX**.

Typical manual steps flagged by the migrator:

1. Rename interactive pages from `.md` to `.mdx`.
2. Port Vue components (`.vue`) to Preact function components (`.tsx`).
3. Replace Vue directives (`v-if`, `v-for`, `@click`) with JSX conditionals and event handlers.
4. Replace VitePress built-ins such as `<Badge />` with your own Preact components.
5. Review custom theme extensions under `.vitepress/theme/`.

See [Markdown and MDX](/guide/markdown-and-mdx) and [Custom themes](/guide/custom-themes).

## After migration

```bash
cd preactpress-docs
pnpm init
pnpm add -D @kamod-ch/preactpress preact vite typescript
pnpm run dev   # add scripts from the getting-started guide
preactpress check
```

Review `.preactpress/config.ts`, then run `preactpress check` before your first production build.

## Planned adapters

```bash
preactpress migrate docusaurus   # planned
preactpress migrate starlight    # planned
```

The adapter architecture lives under `src/node/migrate/` in the PreactPress repository.
