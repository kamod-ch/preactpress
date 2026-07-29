# PreactPress Showcase

A runnable documentation site that demonstrates core PreactPress 2.3 features in one project.

## Features demonstrated

| Feature                | Where                                     |
| ---------------------- | ----------------------------------------- |
| Plugin system          | Mermaid + Playground plugins in config    |
| `preactpress check`    | `pnpm check` script                       |
| Redirect system        | `/legacy` → `/guide/features` in config   |
| AI exports             | `llms.txt`, `llms-full.txt` enabled       |
| Live Preact playground | [Playground page](./guide/playground.mdx) |
| Mermaid diagrams       | [Diagrams page](./guide/diagrams.md)      |
| Component in MDX       | [Features page](./guide/features.mdx)     |

## Quick start

From this directory — no `pnpm install` required (uses the monorepo CLI and auto-links plugins):

```bash
cd examples/showcase
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

From the **repository root**:

```bash
pnpm run dev:showcase
pnpm run check:showcase
pnpm run build:showcase
```

Validate and build from this directory:

```bash
pnpm check
pnpm build
pnpm preview
```

## Project structure

```text
examples/showcase/
├── .preactpress/config.ts   # plugins, redirects, ai exports
├── components/              # Preact components for MDX
├── guide/                   # documentation pages
├── index.md                 # home page
└── package.json
```

## Use as a reference

Copy patterns from this showcase when setting up:

- Library docs with interactive examples
- CI validation before deploy
- AI-agent-readable static exports
- HTTP redirects validated at build time

## Related

- [Full documentation site](https://kamod-ch.github.io/preactpress/) — canonical `templates/docs`
- [Release report](https://github.com/kamod-ch/preactpress/blob/main/RELEASE-REPORT.md) — feature list and benchmarks
- [Upgrade guide](https://github.com/kamod-ch/preactpress/blob/main/UPGRADE.md) — version migration
