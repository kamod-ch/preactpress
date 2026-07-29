# Changelog

All notable changes to PreactPress are documented in this file.

This project follows [Semantic Versioning](https://semver.org/) for the published `@kamod-ch/preactpress` package. Document user-visible behavior changes, migration notes, and deprecations here before cutting a release.

## Unreleased

## [2.3.0] - 2026-07-28

Documentation release. All core features below are stable in `@kamod-ch/preactpress` >= 2.2.0; this release completes the public documentation, migration guides, showcase project, and release report.

### Added

- **Documentation versioning** — version switcher, archived banners, `preactpress version` snapshot CLI, and `versions` init template. See [Versioning guide](https://kamod-ch.github.io/preactpress/guide/versioning/).
- **Plugin system** — typed `PreactPressPlugin` runtime with deterministic hook ordering, built-in `redirects` and `aiExports` plugins, and `@kamod-ch/preactpress/plugin-testkit`. Six official plugins: mermaid, playground, typedoc, component-reference, openapi, changelog.
- **`preactpress check`** — validates links, metadata, frontmatter, duplicates, orphans, nav/sidebar, redirects, i18n, rewrites, config, drafts, and SEO warnings. JSON output and `--strict` mode for CI.
- **Redirect system** — config-time validation, static HTML fallbacks, `_redirects` for Netlify/Cloudflare, and `preactpress-redirects.json` manifest.
- **TypeDoc integration** — `@preactpress/plugin-typedoc` generates API reference pages from TypeDoc output.
- **Component props reference** — `@preactpress/plugin-component-reference` extracts props tables for MDX.
- **Live Preact playground** — `@preactpress/plugin-playground` with sandboxed iframe, Sucrase transpilation, and StackBlitz export.
- **AI-ready exports** — `llms.txt`, `llms-full.txt`, per-route Markdown copies, and `api/context.json` via the `ai` config block.
- **Showcase project** — [`examples/showcase/`](./examples/showcase/) demonstrates plugins, versioning patterns, redirects, and AI exports.
- **Migration guides** — [Upgrade from 1.x / 2.x](./UPGRADE.md), [Migrate from VitePress](https://kamod-ch.github.io/preactpress/guide/migration/vitepress/), and [PreactPress version upgrades](https://kamod-ch.github.io/preactpress/guide/migration/upgrading/).
- **Comparison tables** — README and [Comparison guide](https://kamod-ch.github.io/preactpress/guide/comparison/) vs VitePress, Docusaurus, and Starlight.
- **Known limitations** — [Limitations guide](https://kamod-ch.github.io/preactpress/guide/limitations/) consolidates routing, build, and plugin constraints.
- **Node.js 24** — added to CI test matrix alongside Node 20 and 22.

### Changed

- **Positioning** — PreactPress is now documented as _the documentation framework for Preact libraries, APIs, and AI coding agents_.
- **README structure** — repositioned with Quick Start, Live Demo, comparison, plugins, deployment, and roadmap sections.
- **ROADMAP.md** — updated to reflect shipped plugin API, versioning, check command, and eleven init templates.

### Deprecated

- `llmsTxtPlugin()` — use `aiExportsPlugin()` instead.
- `printCheckResult()` — use `printDocumentationCheckResult()` instead.
- `SiteConfig` type alias — use `ResolvedConfig` instead.

### Fixed

- `listMarkdownRoutes` applies configured route rewrites so static builds and route checks include alias paths (2.2.1).

## [2.2.1] - 2026-07-20

### Fixed

- `listMarkdownRoutes` now applies configured route rewrites so static builds and route checks include alias paths (for example canonical library URLs).

## [1.0.1] - 2026-06-24

### Added

- Playwright coverage for the skip link, theme toggle, and desktop sidebar search.
- Unit tests for theme boot script and bundle-size smoke checks in the build pipeline.
- oxlint and oxfmt as repository quality gates with CI checks for linting and formatting.

### Fixed

- Theme sync now toggles the `dark` class alongside `data-theme`, so Tailwind-based custom themes follow system and stored preferences correctly.
- `useStoredThemeSync` re-applies the theme on mount and reacts to system color-scheme changes when no explicit preference is stored.

### Changed

- Publish workflow runs the full `pnpm run verify` gate (matching CI) before npm publish.
- `pnpm run verify` uses `fmt:check` instead of `fmt` so release verification is read-only.
- Starter templates pin TypeScript `^6.0.3`, aligned with the package toolchain.
- Updated project documentation to reflect the v1.x release line.
