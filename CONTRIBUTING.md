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

## Releases

Maintainers use `pnpm run release:check` before tagging. Tag pushes run `.github/workflows/publish.yml`, which executes `scripts/publish-all.mjs` after workspace verification. See [RELEASE-REPORT.md](./RELEASE-REPORT.md) and [UPGRADE.md](./UPGRADE.md).
