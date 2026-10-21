# Contributing to PreactPress

PreactPress is a pnpm workspace: the core package at the repository root and six official plugins under `packages/`.

## Prerequisites

- Node.js 20, 22, or 24
- pnpm (see `packageManager` in root `package.json`)

## Setup

```bash
pnpm install
pnpm run build
pnpm test
```

The root package does not expose `preactpress` via `pnpm exec` (it is not a dependency of itself). Use `pnpm run preactpress -- <command> [root]`, `node ./bin/preactpress.mjs …`, or the `dev:*` / `build:*` / `check:*` scripts in root `package.json`.

## Quality gates

| Command                                | Purpose                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm run verify:workspace`            | Build, test, and pack-dry-run every `packages/*` plugin                                                             |
| `pnpm run verify`                      | Full release gate: format, lint, core build, coverage, workspace plugins, template checks, browser tests, core pack |
| `pnpm run lint` / `pnpm run fmt:check` | Oxlint and oxfmt                                                                                                    |

Pull requests should pass the same checks as CI (`.github/workflows/ci.yml`). Browser tests require Playwright **Chromium and WebKit** on Node 22 locally:

```bash
pnpm exec playwright install --with-deps chromium webkit
pnpm run test:browser
pnpm exec playwright test --project=desktop-chromium --project=mobile-chromium
pnpm exec playwright test --project=webkit-smoke
```

Other Node versions skip browser installation in CI.

## Plugin development

Each plugin is a standalone package with its own `build` and `test` scripts. Add new official plugins as `packages/plugin-*`; workspace verification discovers them automatically.

User-facing documentation lives in `templates/docs/`. Update guides there when changing public CLI or config behavior.

## Documentation site (`templates/docs`)

| Task                               | Command                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Dev server                         | `pnpm run dev:docs` (from repo root) or `cd templates/docs && pnpm run dev`                |
| Check                              | `pnpm run check:docs`                                                                      |
| Build                              | `pnpm run build:docs`                                                                      |
| Preview static output              | `pnpm run build:docs` then `pnpm run preactpress -- preview templates/docs`                |
| Gallery WebP previews              | `pnpm run capture:template-previews`                                                       |
| Live demo bundles for GitHub Pages | `pnpm run build:template-demos` (optionally `--pages-base /repo-name/` to match Pages URL) |

### Local `file:../..` dependency

Starters under `templates/*` declare `@kamod-ch/preactpress` as `file:../..`. pnpm copies that snapshot at install time. After you change and rebuild the core package, run **`pnpm run link:templates/docs`** (or `node ./scripts/link-local-preactpress.mjs templates/docs`) so `node_modules/@kamod-ch/preactpress` symlinks to the repo root. Otherwise builds may fail with missing modules under `dist/` (stale copy).

You can also run `pnpm install` again inside `templates/docs`. CI demo and preview scripts call the linker automatically.

## Releases

Maintainers use `pnpm run release:check` before tagging. Tag pushes run `.github/workflows/publish.yml`, which executes `scripts/publish-all.mjs` after workspace verification. See [RELEASE-REPORT.md](./RELEASE-REPORT.md) and [UPGRADE.md](./UPGRADE.md).
