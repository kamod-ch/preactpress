# PreactPress Roadmap

This document tracks planned work for the **PreactPress CLI and package** (not content-site TODOs). It is informed by [VitePress](https://vitepress.dev/) parity where it helps documentation sites, while keeping PreactPress intentionally smaller and Preact-first.

**Current version:** 0.1.0

## Vision

PreactPress is a **Vite + Preact static site generator** with a VitePress-like workflow: Markdown/MDX content, config-driven nav, static HTML output, and optional client navigation. The default theme stays small; advanced layouts belong in custom Preact themes.

## Status legend

| Symbol | Meaning |
| --- | --- |
| ✅ | Shipped |
| 🚧 | In progress |
| 📋 | Planned |
| 💡 | Under consideration |
| ➖ | Out of scope (for now) |

---

## Shipped (v0.1.x)

| Area | Feature |
| --- | --- |
| Core | `dev`, `build`, `preview`, `init`, `check` CLI |
| Core | File-based routing (`.md` / `.mdx` → URLs) |
| Core | SSR in dev, static HTML in production |
| Core | SPA client navigation + prefetch hook |
| Core | Incremental builds (`build-manifest.json` in `cacheDir`) |
| Content | Markdown (markdown-it) + MDX (Preact components) |
| Content | Frontmatter, drafts, heading anchors, Shiki highlighting |
| Content | Lazy Markdown payloads (`preactpress-content/*.json`) |
| Content | Auto-generated tag indexes (`/tags/<slug>`) |
| Theme | Default theme: nav, sidebar, search, outline, dark mode, prev/next |
| Theme | Custom theme via `theme: './Layout.tsx'` |
| i18n | Locale folders (`de/`, …), locale-scoped nav/search/tags |
| i18n | Language switcher, `hreflang` alternates (with `site.url`) |
| SEO | Canonical URLs, Open Graph, JSON-LD |
| SEO | `sitemap.xml`, `robots.txt`, RSS/Atom `feed.xml` |
| DX | CSP-friendly boot (`preactpress-theme.js`, non-executable page data template) |
| DX | Bundled starter template + magazine example |
| Docs | README for site authors, CONTRIBUTING for CLI maintainers |
| Docs | Dogfooding template with tutorial content (EN + DE) |

---

## Phase 1 — Documentation parity

High impact for docs sites; moderate effort. Goal: authors coming from VitePress miss fewer day-one features.

| Priority | Feature | Status | Notes |
| --- | --- | --- | --- |
| P1 | Custom Markdown containers (`::: tip`, `::: warning`, …) | 📋 | Most-requested docs feature vs. VitePress |
| P1 | `titleTemplate` (site + per-page override) | 📋 | Today: fixed `{title} \| {site.title}` |
| P1 | Per-page `head` in frontmatter | 📋 | Global `head` + `transformHead` exist |
| P1 | `srcExclude` (glob patterns for non-page Markdown) | 📋 | e.g. exclude `**/README.md`, `**/TODO.md` |
| P2 | Path-based sidebar (`sidebar: { '/guide/': [...] }`) | 📋 | Single global sidebar today |
| P2 | Git-based `lastUpdated` (opt-in) | 📋 | Today: file `mtime` only |
| P2 | Expand Shiki language loading (avoid hardcoded list) | 📋 | Fallback to plain `<pre>` on unknown langs |
| P2 | Template docs pages: Commands, Configuration | 📋 | Extend dogfooding starter |

---

## Phase 2 — Markdown power

Improve technical writing ergonomics without turning every `.md` file into a JS bundle.

| Priority | Feature | Status | Notes |
| --- | --- | --- | --- |
| P2 | GFM alerts (`> [!NOTE]`, `> [!WARNING]`, …) | 📋 | Modern callout syntax |
| P2 | Code line highlighting (`{4}`, `[!code highlight]`) | 📋 | Common in API docs |
| P2 | Snippet import (`<<< @/filepath`) | 📋 | DRY code examples |
| P3 | Custom heading anchor IDs (`# Title {#my-id}`) | 📋 | |
| P3 | Emoji (`:tada:`) | 📋 | |
| P3 | Math (opt-in, e.g. MathJax) | 📋 | |
| P3 | `[[toc]]` inline table of contents | 📋 | Theme outline covers h2/h3 today |
| P3 | Code groups (`::: code-group`) | 📋 | |
| P3 | Markdown file inclusion | 📋 | |

---

## Phase 3 — Theme and routing

Default theme grows carefully; complex marketing layouts stay in custom themes.

| Priority | Feature | Status | Notes |
| --- | --- | --- | --- |
| P2 | `themeConfig.logo` (incl. light/dark) | 📋 | Text logo component exists |
| P2 | Nav dropdowns / nested nav items | 📋 | Flat `{ text, link }` only |
| P2 | Collapsible sidebar groups | 📋 | |
| P2 | Nested sidebar items | 📋 | One group → items level today |
| P2 | Configurable outline levels / label | 📋 | `outline: true \| false` only |
| P2 | Configurable UI labels (beyond hardcoded EN/DE) | 📋 | `labelsForLang()` in default theme |
| P2 | `cleanUrls` flag + hosting documentation | 📋 | Output is already `*/index.html` |
| P2 | Route `rewrites` | 📋 | |
| P3 | Home layout (`layout: home` frontmatter) | 💡 | Magazine example covers custom layouts |
| P3 | Algolia DocSearch integration | 💡 | Local JSON search works today |
| P3 | `socialLinks` in default theme | 💡 | |

---

## Phase 4 — Platform and extensibility

For plugin authors and larger sites. Lower priority until Phases 1–2 cover typical docs needs.

| Priority | Feature | Status | Notes |
| --- | --- | --- | --- |
| P3 | `transformPageData` hook | 💡 | `transformHead` exists |
| P3 | `transformHtml` / `buildEnd` hooks | 💡 | |
| P3 | Async config (fetch sidebar from CMS at build time) | 💡 | |
| P3 | Data loaders / dynamic routes at build time | 💡 | VitePress-style `createContentLoader` |
| P3 | MPA mode (zero client JS) | 💡 | Conflicts with MDX interactivity |
| P3 | Viewport link prefetch (match VitePress behavior) | 💡 | `prefetchPage()` exists, not wired to links |
| P4 | `ignoreDeadLinks` with granular filters | 💡 | `preactpress check` fails on dead links today |

---

## Explicitly out of scope (for now)

These VitePress features are intentionally not targets for the core project:

| Feature | Reason |
| --- | --- |
| Vue SFC in every `.md` page | PreactPress separates static `.md` from interactive `.mdx` |
| Carbon Ads, team/sponsor pages | Not core to a minimal docs SSG |
| Full VitePress default theme clone | Custom Preact themes are the intended escape hatch |
| Node server runtime in production | Static export only — by design |

---

## PreactPress differentiators (keep investing)

Features where PreactPress should stay **ahead** of or **distinct from** VitePress:

| Feature | Why it matters |
| --- | --- |
| `preactpress check` | Dedicated validator for config, nav, links, locales, drafts |
| Tag index pages | Built-in `/tags/<slug>` without extra tooling |
| RSS/Atom feed | `build.feed` emits `feed.xml` |
| CSP-conscious runtime | External theme script + `<template>` page data |
| MD/MDX split | Smaller client bundle for large doc sets |
| Preact ecosystem | Natural fit for Preact/React component libraries |

---

## Comparison snapshot (vs. VitePress)

| Area | PreactPress | VitePress |
| --- | --- | --- |
| UI framework | Preact | Vue 3 |
| Maturity | Early (0.1.x) | Production (powers Vite, Vue, Pinia docs) |
| Default theme | Small, intentional | Large, feature-rich |
| Markdown extensions | Basic + Shiki | Extensive (containers, code groups, includes, …) |
| Unique extras | Tags, RSS, `check`, lazy Markdown | Algolia, home layout, data loaders, MPA mode |

For a detailed gap analysis, see the discussion that led to this roadmap (feature matrix by category: core, markdown, theme, i18n, SEO, DX).

---

## How to contribute

Pick an item marked 📋 in Phase 1 or 2, open an issue to avoid duplicate work, and follow [CONTRIBUTING.md](./CONTRIBUTING.md). Prefer focused PRs (one feature + tests + template/docs update) over large bundles.

When shipping a roadmap item, move it to **Shipped** and note the version in the table header.
