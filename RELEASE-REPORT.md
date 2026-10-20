# Release report (maintainers)

## Published packages

| Package                                   | Path                                  |
| ----------------------------------------- | ------------------------------------- |
| `@kamod-ch/preactpress`                   | Repository root                       |
| `@preactpress/plugin-typedoc`             | `packages/plugin-typedoc`             |
| `@preactpress/plugin-mermaid`             | `packages/plugin-mermaid`             |
| `@preactpress/plugin-playground`          | `packages/plugin-playground`          |
| `@preactpress/plugin-component-reference` | `packages/plugin-component-reference` |
| `@preactpress/plugin-openapi`             | `packages/plugin-openapi`             |
| `@preactpress/plugin-changelog`           | `packages/plugin-changelog`           |

## Pre-release checklist

1. `pnpm run release:check` (format, lint, core tests with coverage, **workspace plugin gate**, templates, browser tests, pack dry-runs).
2. Confirm changelog entries in [CHANGELOG.md](./CHANGELOG.md).
3. Tag `v*` on the commit to publish; GitHub Actions runs [publish.yml](.github/workflows/publish.yml).

## Publish behavior

`scripts/publish-all.mjs`:

- Runs `pnpm run verify:workspace` before any registry mutation.
- Publishes only versions **not** already on npm; skips unchanged plugin versions.
- **Fails** if the core version in root `package.json` already exists on the registry (prevents partial duplicate core releases).
- Supports `--dry-run` for preflight output without `pnpm publish`.

Plugin-only version bumps may use `pnpm run release:plugins` / `release:plugins:dry` without a core tag.
