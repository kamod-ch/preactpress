---
title: Release notes
description: PreactPress version history, upgrade paths, and release report
---

# Release notes

PreactPress follows [Semantic Versioning](https://semver.org/). User-visible changes are documented in [CHANGELOG.md](https://github.com/kamod-ch/preactpress/blob/main/CHANGELOG.md) before each npm publish.

## Latest release: 2.3.0 (2026-07-28)

Documentation release completing the public docs for all core 2.x features:

- Documentation versioning
- Plugin system and six official plugins
- `preactpress check`
- Redirect system
- TypeDoc, component reference, and live playground plugins
- AI exports (`llms.txt`, `llms-full.txt`)
- Showcase project at [`examples/showcase`](https://github.com/kamod-ch/preactpress/tree/main/examples/showcase)

See the full [Release report](https://github.com/kamod-ch/preactpress/blob/main/RELEASE-REPORT.md) for features, benchmarks, and known limitations.

## Upgrade paths

| From              | Guide                                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| PreactPress 2.2.x | [Upgrade PreactPress](/guide/migration/upgrading) — no breaking changes    |
| PreactPress 1.x   | [UPGRADE.md](https://github.com/kamod-ch/preactpress/blob/main/UPGRADE.md) |
| VitePress         | [Migrate from VitePress](/guide/migration/vitepress)                       |

## Breaking changes policy

- **Patch** releases are backward compatible bug fixes.
- **Minor** releases add features without breaking existing public APIs.
- **Major** releases may remove deprecated aliases listed in the [Release report](https://github.com/kamod-ch/preactpress/blob/main/RELEASE-REPORT.md).

Current deprecations (removal planned in 3.0.0):

| Deprecated           | Replacement                       |
| -------------------- | --------------------------------- |
| `llmsTxtPlugin()`    | `aiExportsPlugin()`               |
| `printCheckResult()` | `printDocumentationCheckResult()` |
| `SiteConfig`         | `ResolvedConfig`                  |

## Subscribe to releases

Watch [GitHub Releases](https://github.com/kamod-ch/preactpress/releases) or enable the `@preactpress/plugin-changelog` plugin to embed release notes in your own docs site.
