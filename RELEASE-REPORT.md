# PreactPress 2.3.0 — Release Report

**Release date:** 2026-07-28  
**Package:** `@kamod-ch/preactpress`  
**Positioning:** PreactPress is the documentation framework for Preact libraries, APIs, and AI coding agents.

---

## Feature list

### Core framework

| Feature | Status | Documentation |
| ------- | ------ | ------------- |
| Markdown / MDX routing | Stable | [Creating pages](https://kamod-ch.github.io/preactpress/guide/creating-pages/) |
| Default docs theme | Stable | [Default theme](https://kamod-ch.github.io/preactpress/guide/default-theme/) |
| i18n (locales) | Stable | [Routing and i18n](https://kamod-ch.github.io/preactpress/guide/routing/) |
| Local search + Algolia | Stable | [Configuration](https://kamod-ch.github.io/preactpress/guide/configuration/) |
| Content collections | Stable | [Content collections](https://kamod-ch.github.io/preactpress/guide/content-collections/) |
| Custom themes | Stable | [Custom themes](https://kamod-ch.github.io/preactpress/guide/custom-themes/) |
| GitHub Actions composite action | Stable | [action/README](./action/README.md) |

### Release features (2.x)

| Feature | Status | Documentation |
| ------- | ------ | ------------- |
| **Documentation versioning** | Stable | [Versioning guide](https://kamod-ch.github.io/preactpress/guide/versioning/) |
| **Plugin system** | Stable | [Plugins](https://kamod-ch.github.io/preactpress/guide/plugins/) |
| **`preactpress check`** | Stable | [CLI and validation](https://kamod-ch.github.io/preactpress/guide/commands/) |
| **Redirect system** | Stable | [Configuration — redirects](https://kamod-ch.github.io/preactpress/guide/configuration/#redirects) |
| **AI exports** (`llms.txt`, etc.) | Stable | [AI-ready docs](https://kamod-ch.github.io/preactpress/guide/ai-coding-tools/) |

### Official plugins

| Plugin | Status | Documentation |
| ------ | ------ | ------------- |
| `@preactpress/plugin-mermaid` | Stable | [Mermaid plugin](https://kamod-ch.github.io/preactpress/guide/plugin-mermaid/) |
| `@preactpress/plugin-playground` | Stable | [Playground plugin](https://kamod-ch.github.io/preactpress/guide/plugin-playground/) |
| `@preactpress/plugin-typedoc` | Stable | [TypeDoc plugin](https://kamod-ch.github.io/preactpress/guide/plugin-typedoc/) |
| `@preactpress/plugin-component-reference` | Stable | [Component reference](https://kamod-ch.github.io/preactpress/guide/plugin-component-reference/) |
| `@preactpress/plugin-openapi` | Stable | [OpenAPI plugin](https://kamod-ch.github.io/preactpress/guide/plugin-openapi/) |
| `@preactpress/plugin-changelog` | Stable | [Changelog plugin](https://kamod-ch.github.io/preactpress/guide/plugin-changelog/) |

### Init templates (11)

`default`, `docs`, `blog`, `product-docs`, `api-docs`, `saas-docs`, `knowledge-base`, `versions`, `monorepo`, `magazine`, `hono`

### Showcase and examples

| Artifact | Path |
| -------- | ---- |
| Live documentation site | [kamod-ch.github.io/preactpress](https://kamod-ch.github.io/preactpress/) |
| Feature showcase | [`examples/showcase/`](./examples/showcase/) |
| GitHub Actions workflows | [`examples/github-actions/`](./examples/github-actions/) |

---

## Breaking changes

**None in 2.3.0** relative to 2.2.x.

### From 1.x to 2.x (historical)

| Change | Migration |
| ------ | --------- |
| Plugin-based extensions | Register plugins in `plugins: []`; legacy hooks still merged |
| `SiteConfig` renamed | Use `ResolvedConfig` |
| `llmsTxtPlugin()` removed (deprecated) | Use `aiExportsPlugin()` |
| Stricter config validation | Unknown options throw `ConfigError` |

See [UPGRADE.md](./UPGRADE.md).

---

## Migration

| Audience | Resource |
| -------- | -------- |
| VitePress users | [guide/migration/vitepress](https://kamod-ch.github.io/preactpress/guide/migration/vitepress/) + `preactpress migrate vitepress` |
| PreactPress 1.x → 2.x | [UPGRADE.md](./UPGRADE.md) |
| PreactPress 2.2 → 2.3 | [UPGRADE.md](./UPGRADE.md) — documentation-only release |
| Index of all paths | [MIGRATION.md](./MIGRATION.md) |

---

## Benchmarks

Baseline captured 2026-07-28 on Node v24.18.0 (fixture: 100 pages, seeded content).

| Metric | Value |
| ------ | ----- |
| Cold build | 608 ms |
| Warm build | 355 ms |
| Peak memory | 491 MB |
| Search index | 34 KB |
| Sample HTML | 28 KB |
| Main JS | 126 KB |
| Main CSS | 58 KB |

Full results: [`benchmarks/results/baseline.json`](./benchmarks/results/baseline.json).  
Run locally: `pnpm run benchmark`.

CI runs `benchmark:ci` on pull requests against committed baseline thresholds.

---

## Known limitations

Consolidated in the [Limitations guide](https://kamod-ch.github.io/preactpress/guide/limitations/). Summary:

| Area | Limitation |
| ---- | ---------- |
| Routing | No dynamic MDX route templates; dynamic paths must be known at build time |
| Rewrites | No pattern-based rewrites (only explicit route maps) |
| Production | Static output only — no bundled Node server runtime |
| Vue | No Vue SFC support; use Preact MDX components |
| Theme | Not a pixel-perfect VitePress clone |
| Plugins | `apiDocs` / `openapi` top-level config keys are reserved; use official plugins |
| Changelog plugin | GitLab/Gitea providers not yet implemented (architecture ready) |
| Browser tests | Playwright runs on Node 22 in CI only (unit tests cover 20/22/24) |

---

## Verification performed

| Check | Result |
| ----- | ------ |
| Unit tests (Vitest) | Run on Node 20, 22, 24 |
| Browser tests (Playwright) | Node 22 |
| `preactpress check templates/docs` | Required before release |
| `check:templates` (all 11 init templates) | Required before release |
| `pnpm run verify` | Full gate: fmt, lint, build, coverage, templates, browser, pack |

---

## Recommended next release (2.4.0)

Priority candidates:

1. **GitLab / Gitea changelog providers** — extend `@preactpress/plugin-changelog`
2. **Performance budgets in CI** — enforce HTML/JS/CSS size thresholds from benchmarks
3. **Pattern-based rewrites** — glob or regex route aliases
4. **Plugin marketplace metadata** — machine-readable registry for community plugins
5. **Expanded i18n docs** — full locale workflow beyond the German demo

Non-goals remain unchanged: production Node server, Vue SFCs, full VitePress theme parity.

---

## Public API consistency

### Stable exports (`@kamod-ch/preactpress`)

| Export path | Purpose |
| ----------- | ------- |
| `.` | Build, config, check, init, migrate, plugins, types |
| `./config` | `defineConfig`, plugin types, built-in plugins |
| `./client` | Theme utilities, `usePageHead` |
| `./shared` | Routing, sidebar, search helpers |
| `./plugins` | Built-in plugin entry points |
| `./plugin-testkit` | Plugin author test utilities |
| `./content` | Content collections API |

### Removed duplicate / experimental APIs

Deprecated aliases remain for one major cycle with JSDoc `@deprecated` tags. No experimental `@experimental` exports ship in the public API.

| Deprecated | Replacement | Removal target |
| ---------- | ----------- | -------------- |
| `llmsTxtPlugin()` | `aiExportsPlugin()` | 3.0.0 |
| `printCheckResult()` | `printDocumentationCheckResult()` | 3.0.0 |
| `SiteConfig` | `ResolvedConfig` | 3.0.0 |

---

## Documentation deliverables (this release)

- [x] README repositioned and restructured
- [x] CHANGELOG 2.3.0 entry
- [x] UPGRADE.md and MIGRATION.md
- [x] Guide: versioning, limitations, comparison, plugin-changelog, migration/upgrading
- [x] Showcase project (`examples/showcase/`)
- [x] ROADMAP.md updated
- [x] Release report (this document)
- [x] Node 24 in CI matrix
- [x] Ecosystem registry documentation link for changelog plugin
