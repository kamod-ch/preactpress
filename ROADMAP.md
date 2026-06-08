# PreactPress roadmap

PreactPress is an early-stage Vite and Preact static site generator. The current focus is release quality: clear documentation, dependable mobile and accessible defaults, and stable behavior across starter templates.

## Shipped in 0.1.x

- Markdown and MDX routing with development SSR and static builds
- client navigation, prefetching, incremental builds, and optional MPA mode
- default theme with nav, nested sidebars, outline, search, dark mode, tags, i18n, and responsive drawer navigation
- local search and Algolia DocSearch
- Markdown containers, alerts, highlighting, snippets, includes, code groups, TOC, emoji, and optional math
- home/page/doc layouts, custom themes, content loaders, dynamic routes, and build hooks
- canonical metadata, Open Graph, JSON-LD, sitemap, robots, and feeds
- `preactpress check` validation and four init templates
- canonical English documentation starter with a small German i18n demo

## Next priorities

### Documentation quality

- keep `templates/docs` synchronized with every public option and CLI behavior
- add migration notes when public behavior changes
- publish a hosted copy of the canonical docs when repository and release URLs are finalized

### Accessibility and responsive UX

- maintain keyboard and screen-reader coverage for navigation, search, dialogs, and content widgets
- add automated browser coverage for mobile drawer focus behavior and viewport overflow
- audit custom starter themes against the same baseline as the default theme

### Release readiness

- define browser support and compatibility policy
- add package tarball smoke tests and release automation
- document versioning, changelog, and deprecation policy
- add performance budgets for generated HTML, CSS, and client JavaScript

### Ecosystem and extensibility

- stabilize data-loader and dynamic-route examples
- document extension patterns before introducing a broader plugin API
- expand real-world deployment examples based on verified hosting configurations

## Non-goals for core

- a production Node server runtime
- framework-specific Vue single-file components
- a full clone of the VitePress default theme
- specialized sponsor, team, or advertising components

Complex product and editorial layouts remain the responsibility of custom Preact themes.
