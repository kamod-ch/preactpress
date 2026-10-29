# Product facts · @preactpress/plugin-playground

Verified from repo docs and source (2026-10-29).

| Fact | Source |
|------|--------|
| Package name | `@preactpress/plugin-playground` |
| Purpose | Live Preact sandboxes in PreactPress MDX docs |
| Parent framework | PreactPress — docs framework for Preact libraries (Preact 11, MDX, Vite-style workflow) |
| Install | `pnpm add -D @preactpress/plugin-playground` |
| Plugin registration | `playgroundPlugin()` in `.preactpress/config.ts` |
| MDX component | `<Playground code={...} />` or multi-file `files` + `entry` + optional `dependencies` |
| Preview security | Sandboxed iframe (`allow-scripts allow-modals` only); CDN allowlist for externals |
| Lazy loading | Playground UI loads only on pages that render `<Playground />` |
| UI brand accent in CSS | `#646cff` (default `--pp-brand`) |
| PreactPress wordmark fill | `#213547` (logo SVG) |
| Live demo site | https://kamod-ch.github.io/preactpress/ |
| GitHub | https://github.com/kamod-ch/preactpress |
| License | MIT |

Not claimed: download counts, testimonials, third-party logos, or comparison rankings.
