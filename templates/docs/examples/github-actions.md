---
title: GitHub Actions
description: Official PreactPress workflow templates, composite action, and CI patterns for check, build, and GitHub Pages.
tags:
  - deploy
  - examples
---

PreactPress ships official GitHub Actions support: a composite action for install, cache, check, and build, plus copy-ready workflow templates for pull request checks, GitHub Pages, and Node.js matrices.

## Composite action

Use the maintained action from the PreactPress repository:

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: build
    node-version: 22
```

| Input               | Default | Description                                |
| ------------------- | ------- | ------------------------------------------ |
| `command`           | `all`   | `install`, `check`, `build`, or `all`      |
| `node-version`      | `22`    | Node.js version                            |
| `working-directory` | `.`     | Site root (for monorepos: `packages/docs`) |
| `package-manager`   | `pnpm`  | `pnpm`, `npm`, or `yarn`                   |
| `strict`            | `false` | Fail on check warnings                     |
| `base`              | —       | `--base` for GitHub Pages project sites    |
| `upload-artifact`   | `false` | Upload `dist/` after build                 |

Pin to a [release tag](https://github.com/kamod-ch/preactpress/releases). See the [action README on GitHub](https://github.com/kamod-ch/preactpress/tree/main/action) for all inputs.

### Pull request workflow with the action

```yaml
name: PreactPress CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kamod-ch/preactpress/action@v2
        with:
          command: all
          node-version: 22
          strict: true
          check-args: --format json --output reports/docs-check.json
          upload-artifact: true
```

## Official workflow templates

Copy these files from the PreactPress repository into your site under `.github/workflows/`:

| Template              | Path in repo                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| PR checks + artifacts | [`examples/github-actions/check.yml`](https://github.com/kamod-ch/preactpress/blob/main/examples/github-actions/check.yml)             |
| GitHub Pages deploy   | [`examples/github-actions/pages.yml`](https://github.com/kamod-ch/preactpress/blob/main/examples/github-actions/pages.yml)             |
| Node.js 20/22 matrix  | [`examples/github-actions/node-matrix.yml`](https://github.com/kamod-ch/preactpress/blob/main/examples/github-actions/node-matrix.yml) |

### check.yml — pull request checks

Runs `preactpress check`, builds the site, and uploads a JSON check report plus the `dist/` artifact. Use this on every pull request to catch broken links, missing metadata, and invalid navigation before merge.

### pages.yml — GitHub Pages

Builds with the correct `--base` path for project sites and deploys via `actions/deploy-pages`. Enable **Settings → Pages → Source: GitHub Actions** in your repository.

For a user or organization site at `https://user.github.io/` (no repo subpath), remove the `--base` flag from the build step and set `site.base: "/"` in config.

### node-matrix.yml — Node.js matrix

Runs check and build on Node.js 20 and 22. Uploads the build artifact from Node 22 only to avoid duplicate artifacts.

## Caching

All templates use `actions/setup-node` with `cache: pnpm` (or the equivalent for npm/yarn). This caches the package manager store between workflow runs.

PreactPress also writes an incremental build cache under `node_modules/.preactpress`. Do not deploy that directory; it is safe to keep in CI checkouts for faster rebuilds.

## Strict mode and external links

Treat warnings as failures in release pipelines:

```yaml
- run: pnpm exec preactpress check --strict
```

Or pass `strict: true` to the composite action.

External link verification requires network access and can be flaky. Enable only when needed:

```yaml
- run: pnpm exec preactpress check --external
```

## Monorepos

Point the action or workflow at the site package:

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    working-directory: packages/docs
    command: all
```

Or use workspace commands:

```yaml
- run: pnpm exec preactpress workspaces check
- run: pnpm exec preactpress workspaces build
```

## Related guides

- [Deploy](/guide/deploy) — platform settings for GitHub Pages, Netlify, Vercel, and more
- [Documentation check in CI](/examples/github-actions-check) — JSON reports, strict mode, external links
- [Cloudflare Pages](/examples/cloudflare-pages)
- [Netlify](/examples/netlify)
- [Vercel](/examples/vercel)
- [S3-compatible hosts](/examples/s3-deploy)
- [Own server](/examples/own-server)

Examples never embed deployment secrets. Store credentials in GitHub **Settings → Secrets and variables → Actions** or in your host's environment settings.
