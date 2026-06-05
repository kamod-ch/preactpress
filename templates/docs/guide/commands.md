---
title: Commands
description: PreactPress CLI reference for local development and production builds
---

PreactPress ships a small CLI. Run commands from your site root (where `.preactpress/config.ts` lives).

## Development

```bash
pnpm exec preactpress dev
```

Starts Vite with SSR, hot reload, and the same HTML head shape as production.

## Production

```bash
pnpm exec preactpress build
pnpm exec preactpress preview
```

`build` writes static HTML to `outDir` (default `dist/`). `preview` serves that folder locally — not for production hosting.

## Project setup

```bash
pnpm exec preactpress init
pnpm exec preactpress init --template docs
```

Scaffolds a new site. The `docs` template includes this guide, i18n examples, and reference pages.

## Validation

```bash
pnpm exec preactpress check
```

Validates config, route collisions, nav/sidebar links, internal Markdown links, and draft pages before you deploy.

::: tip
Add `check` to CI so broken sidebar links fail the pipeline before merge.
:::
