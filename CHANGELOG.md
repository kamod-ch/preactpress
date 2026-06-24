# Changelog

All notable changes to PreactPress will be documented in this file.

This project follows semantic versioning for the published `@kamod-ch/preactpress` package. Document user-visible behavior changes, migration notes, and deprecations here before cutting a release.

## Unreleased

## [1.0.1] - 2026-06-24

### Added

- Playwright coverage for the skip link, theme toggle, and desktop sidebar search.
- Unit tests for theme boot script and bundle-size smoke checks in the build pipeline.
- oxlint and oxfmt as repository quality gates with CI checks for linting and formatting.

### Fixed

- Theme sync now toggles the `dark` class alongside `data-theme`, so Tailwind-based custom themes (for example PreactHub) follow system and stored preferences correctly.
- `useStoredThemeSync` re-applies the theme on mount and reacts to system color-scheme changes when no explicit preference is stored.

### Changed

- Publish workflow runs the full `pnpm run verify` gate (matching CI) before npm publish.
- `pnpm run verify` uses `fmt:check` instead of `fmt` so release verification is read-only.
- Starter templates pin TypeScript `^6.0.3`, aligned with the package toolchain.
- Updated project documentation to reflect the v1.x release line.
