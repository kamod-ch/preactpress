# PreactPress roadmap (maintainers)

**Current release:** `@kamod-ch/preactpress` **3.0.1** with **six official plugins** (`@preactpress/plugin-*`), **Preact 11**, and a **plugin architecture** for optional packages.

Canonical user documentation: [templates/docs](templates/docs/).

## Near-term priorities

1. **Workspace reliability** — CI and `release:check` validate every publishable plugin (see `plans/` audit prompts).
2. **Docs template parity** — Keep `templates/docs` aligned with CLI, config, and plugin options.
3. **Changelog providers** — GitLab and Gitea (design: [design/changelog-providers.md](./design/changelog-providers.md)).
4. **Parameterized rewrites** — Design-first routing feature (see [design/pattern-rewrites.md](./design/pattern-rewrites.md)).
5. **Performance** — PR gate stays at 100-page benchmarks; scheduled 1k-page warm-build profiling for large sites.

## Non-goals (core)

- Production Node server runtime
- Vue SFC support
- Full VitePress theme clone

## Historical note

The file `docs/internal/feature-roadmap.md` is a **superseded** architecture audit from v2.2.1. Do not use it for current status; this roadmap and `templates/docs` are authoritative.
