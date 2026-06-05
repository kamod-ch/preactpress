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
| Theme | Algolia DocSearch (`themeConfig.search.provider: 'algolia'`), `socialLinks` |
| Theme | Custom theme via `theme: './Layout.tsx'` |
| i18n | Locale folders (`de/`, …), locale-scoped nav/search/tags |
| i18n | Language switcher, `hreflang` alternates (with `site.url`) |
| SEO | Canonical URLs, Open Graph, JSON-LD |
| SEO | `sitemap.xml`, `robots.txt`, RSS/Atom `feed.xml` |
| DX | CSP-friendly boot (`preactpress-theme.js`, non-executable page data template) |
| DX | Minimal bundled starter + optional `docs` and `magazine` init templates |
| Docs | README for site authors, CONTRIBUTING for CLI maintainers |
| Docs | Docs starter template with tutorial content (EN + DE) |
| Markdown | Custom containers (`::: tip`, `::: warning`, `::: details`, …) |
| Markdown | GFM alerts (`> [!NOTE]`, …), code line highlighting, snippet import (`<<< @/…`) |
| Markdown | Custom heading IDs, emoji, opt-in math, `[[toc]]`, code groups, `@include` |
| Config | `titleTemplate`, per-page `head`, `srcExclude`, path-based `sidebar` |
| Config | `lastUpdatedGit` opt-in; Shiki languages loaded on demand |
| Docs | Template pages: Commands, Configuration (EN + DE) |

---

## Phase 1 — Documentation parity

High impact for docs sites; moderate effort. Goal: authors coming from VitePress miss fewer day-one features.

| Priority | Feature | Status | Notes |
| --- | --- | --- | --- |
| P1 | Custom Markdown containers (`::: tip`, `::: warning`, …) | ✅ | v0.1.x — `tip`, `warning`, `danger`, `info`, `note`, `details`, … |
| P1 | `titleTemplate` (site + per-page override) | ✅ | v0.1.x — `site.titleTemplate`, frontmatter override, `false` for raw title |
| P1 | Per-page `head` in frontmatter | ✅ | v0.1.x — merged after global `head` / `transformHead` |
| P1 | `srcExclude` (glob patterns for non-page Markdown) | ✅ | v0.1.x — glob patterns in config, e.g. `**/README.md` |
| P2 | Path-based sidebar (`sidebar: { '/guide/': [...] }`) | ✅ | v0.1.x — longest prefix match; array form unchanged |
| P2 | Git-based `lastUpdated` (opt-in) | ✅ | v0.1.x — `lastUpdatedGit: true` in config |
| P2 | Expand Shiki language loading (avoid hardcoded list) | ✅ | v0.1.x — languages loaded on demand per page |
| P2 | Template docs pages: Commands, Configuration | ✅ | v0.1.x — EN + DE in `templates/docs` |

---

## Phase 2 — Markdown power

Improve technical writing ergonomics without turning every `.md` file into a JS bundle.

| Priority | Feature | Status | Notes |
| --- | --- | --- | --- |
| P2 | GFM alerts (`> [!NOTE]`, `> [!WARNING]`, …) | ✅ | v0.1.x — converted to container markup |
| P2 | Code line highlighting (`{4}`, `[!code highlight]`) | ✅ | v0.1.x — Shiki transformers (meta + notation) |
| P2 | Snippet import (`<<< @/filepath`) | ✅ | v0.1.x — `@/` = srcDir, regions via `#name` |
| P3 | Custom heading anchor IDs (`# Title {#my-id}`) | ✅ | v0.1.x — `{#id}` suffix on headings |
| P3 | Emoji (`:tada:`) | ✅ | v0.1.x — `markdown.emoji` (default on) |
| P3 | Math (opt-in, e.g. MathJax) | ✅ | v0.1.x — opt-in `markdown.math` |
| P3 | `[[toc]]` inline table of contents | ✅ | v0.1.x — h2/h3 links at marker position |
| P3 | Code groups (`::: code-group`) | ✅ | v0.1.x — CSS tab UI, `[label]` on fences |
| P3 | Markdown file inclusion | ✅ | v0.1.x — `<!--@include: path-->` with regions |

---

## Phase 3 — Theme and routing

Default theme grows carefully; complex marketing layouts stay in custom themes.

| Priority | Feature | Status | Notes |
| --- | --- | --- | --- |
| P2 | `themeConfig.logo` (image URL; light/dark variants) | ✅ | v0.1.x — string or `{ light, dark }`; follows theme toggle |
| P3 | Home/page layouts (`layout: home` / `layout: page` frontmatter) | ✅ | Default theme supports hero, features, page chrome toggles, and unstyled page content |
| P2 | Nav dropdowns / nested nav items | ✅ | v0.1.x — `items` on nav entries |
| P2 | Collapsible sidebar groups | ✅ | v0.1.x — `collapsed` on sidebar groups |
| P2 | Nested sidebar items | ✅ | v0.1.x — recursive `items` on sidebar entries |
| P2 | Configurable outline levels / label | ✅ | Page frontmatter supports `outline: false`, number, range, and `deep`; `themeConfig.labels.onThisPage` overrides label |
| P2 | Configurable UI labels (beyond hardcoded EN/DE) | ✅ | v0.1.x — `themeConfig.labels` merged with EN/DE defaults |
| P2 | `cleanUrls` flag + hosting documentation | ✅ | v0.1.x — default `true`; routing docs cover hosting |
| P2 | Route `rewrites` | ✅ | v0.1.x — map public routes to existing content |
| P3 | Algolia DocSearch integration | ✅ | v0.1.x — `themeConfig.search.provider: 'algolia'` |
| P3 | `socialLinks` in default theme | ✅ | v0.1.x — nav bar icons (built-in + custom SVG) |

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
| Unique extras | Tags, RSS, `check`, lazy Markdown | Home layout, data loaders, MPA mode |

For a detailed gap analysis, see the discussion that led to this roadmap (feature matrix by category: core, markdown, theme, i18n, SEO, DX).

---

## How to contribute

Pick an item marked 📋 in Phase 1 or 2, open an issue to avoid duplicate work, and follow [CONTRIBUTING.md](./CONTRIBUTING.md). Prefer focused PRs (one feature + tests + template/docs update) over large bundles.

When shipping a roadmap item, move it to **Shipped** and note the version in the table header.
