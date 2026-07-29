---
title: Known limitations
description: Current constraints of PreactPress routing, builds, plugins, and deployment
---

# Known limitations

PreactPress is a static documentation framework. The items below are intentional boundaries or not-yet-implemented features — not bugs. Check [GitHub Issues](https://github.com/kamod-ch/preactpress/issues) for planned work.

## Routing

| Limitation               | Details                                                      | Workaround                                                      |
| ------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------- |
| No dynamic MDX templates | Each route maps to a file known at build time                | Use [dynamic routes](/guide/advanced) with explicit path lists  |
| No pattern rewrites      | `rewrites` only supports explicit route maps                 | List aliases individually or use `redirects` for HTTP redirects |
| No filesystem router     | Routes come from Markdown files, not a file-based App Router | Add files under `srcDir`                                        |

See [Routing and i18n](/guide/routing) for current routing behavior.

## Build and runtime

| Limitation                  | Details                                               | Workaround                                                                                                              |
| --------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Static output only          | No bundled production Node server                     | Deploy `dist/` to a static host; use `preactpress preview` locally                                                      |
| Dynamic paths at build time | Content loaders must resolve paths during `build`     | Pre-generate route lists in config or loaders                                                                           |
| Incremental builds          | Cache helps warm builds; cold builds scan all content | Use `cacheDir`; see benchmarks in [RELEASE-REPORT](https://github.com/kamod-ch/preactpress/blob/main/RELEASE-REPORT.md) |

## UI and theme

| Limitation                      | Details                                 | Workaround                                                                                                  |
| ------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| No Vue SFC support              | Component model is Preact + MDX         | Rewrite Vue components as Preact; migrate from VitePress with [migration guide](/guide/migration/vitepress) |
| Not a VitePress clone           | Default theme is similar, not identical | Custom theme via [Custom themes](/guide/custom-themes)                                                      |
| No built-in sponsor/team blocks | Marketing sections are DIY              | Use MDX components or custom home layout                                                                    |

## Configuration

| Limitation                        | Details                             | Workaround                                                          |
| --------------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `apiDocs` / `openapi` config keys | Reserved; not active in core        | Use `@preactpress/plugin-typedoc` and `@preactpress/plugin-openapi` |
| Strict config validation          | Unknown options throw `ConfigError` | Fix typos; see [Configuration](/guide/configuration)                |

## Plugins

| Limitation                       | Details                                                            | Workaround                                   |
| -------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| Changelog: GitLab/Gitea          | Provider interface exists; only local/GitHub/changesets ship today | Use GitHub Releases or local `CHANGELOG.md`  |
| Playground: dependency allowlist | Sandboxed iframe restricts npm imports                             | Configure allowed packages in plugin options |
| TypeDoc: build-time only         | API pages generated during `build`, not in dev SSR for all setups  | Run `build` to verify API output             |

## AI exports

| Limitation       | Details                                        | Workaround                      |
| ---------------- | ---------------------------------------------- | ------------------------------- |
| Static snapshots | `llms.txt` reflects build output, not live CMS | Rebuild after content changes   |
| Size limits      | Very large sites produce large `llms-full.txt` | Split docs or tune `ai` options |

See [AI-ready documentation](/guide/ai-coding-tools).

## Validation (`preactpress check`)

| Limitation                   | Details                                      | Workaround                     |
| ---------------------------- | -------------------------------------------- | ------------------------------ |
| External URL checks optional | Network required for `--external`            | Run external checks in CI only |
| Plugin checks opt-in         | `check.plugins: true` runs plugin validators | Enable in config for CI        |

## Node.js and tooling

| Limitation          | Details                                               |
| ------------------- | ----------------------------------------------------- |
| Node 20+ required   | Node 18 is not supported                              |
| Browser tests in CI | Playwright runs on Node 22; unit tests cover 20/22/24 |

## Reporting issues

If a limitation blocks your project, open an issue with:

1. Your PreactPress version
2. Minimal config repro
3. Expected vs actual behavior

For feature requests, check [ROADMAP](https://github.com/kamod-ch/preactpress/blob/main/ROADMAP.md) first.
