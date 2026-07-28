# PreactPress roadmap

PreactPress is a Vite and Preact documentation framework at **v2.x**. The current focus is dependable public APIs, complete documentation, official plugins, and release processes that make behavior changes easy to track.

**Positioning:** PreactPress is the documentation framework for Preact libraries, APIs, and AI coding agents.

## Shipped in 2.x

- Markdown and MDX routing with development SSR and static builds
- Default docs theme with nav, sidebar, outline, search, dark mode, tags, i18n, and version switcher
- **Plugin system** with typed hooks and six official plugins (mermaid, playground, typedoc, component-reference, openapi, changelog)
- **`preactpress check`** — link, route, redirect, nav, locale, and config validation
- **Documentation versioning** — `current/` + `versions/` layout and `preactpress version` CLI
- **Redirect system** — validated redirects with HTML fallbacks and `_redirects` export
- **AI exports** — `llms.txt`, `llms-full.txt`, per-page Markdown, `api/context.json`
- Local search and Algolia DocSearch
- Content collections, dynamic routes, custom themes, and build hooks
- Eleven init templates including `versions` and `monorepo`
- GitHub Actions composite action (`kamod-ch/preactpress/action@v2`)
- Canonical English documentation with German i18n demo
- Feature showcase at `examples/showcase/`
- oxlint, oxfmt, Vitest, Playwright, and benchmark CI gates

## Next priorities

### Documentation quality

- Keep `templates/docs` synchronized with every public option and CLI behavior
- Expand deployment and plugin examples from verified hosting configurations
- Community plugin registry metadata

### Performance

- Enforce HTML/JS/CSS size budgets in CI from benchmark baselines
- Profile warm builds for 1,000+ page sites

### Ecosystem

- GitLab and Gitea providers for `@preactpress/plugin-changelog`
- Pattern-based route rewrites
- Additional changelog and API doc providers

### Accessibility

- Maintain keyboard and screen-reader coverage for navigation, search, and dialogs
- Automated browser coverage for mobile drawer focus behavior

## Non-goals for core

- a production Node server runtime
- framework-specific Vue single-file components
- a full clone of the VitePress default theme
- specialized sponsor, team, or advertising components

Complex product and editorial layouts remain the responsibility of custom Preact themes.

## Release cadence

- **Patch** — bug fixes, doc corrections
- **Minor** — new plugins, features, templates (backward compatible)
- **Major** — breaking API changes (deprecated aliases removed)

See [CHANGELOG.md](./CHANGELOG.md), [UPGRADE.md](./UPGRADE.md), and [RELEASE-REPORT.md](./RELEASE-REPORT.md).
