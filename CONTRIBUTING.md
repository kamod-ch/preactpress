# Contributing to PreactPress

This guide is for people working on the **PreactPress CLI and package**, not for authors building content sites. If you only want to create a site, start with [README.md](./README.md). For planned features and priorities, see [ROADMAP.md](./ROADMAP.md).

## Monorepo

This repo lists `preactpress` in `pnpm-workspace.yaml`. Add `preactpress` as a devDependency (`workspace:*`) to consume the CLI from another package.

## Two different “build” commands

From the **package root** (`preactpress/`), two build concepts apply:

| Command | What it builds |
| --- | --- |
| `pnpm run build` | Compiles the **CLI** TypeScript sources to `dist/` (`tsc`). Does **not** build a content site. |
| `pnpm exec preactpress build [root]` | Runs the **static site generator** for a site (default: current directory). Writes HTML + assets to `outDir` (e.g. `templates/default/dist/`). |

After changing CLI or client code, run `pnpm run build` before `pnpm run dev` or `node ./bin/preactpress.mjs …` so `dist/` is up to date. On `pnpm install`, the `prepare` script builds `dist/` automatically — you only need a manual build after editing sources.

From this directory: `pnpm install`, `pnpm run build`, then `./bin/preactpress.mjs --help` (or `pnpm exec preactpress` when linked from a workspace).

## Bundled demos

These scripts target the bundled minimal starter without passing a path each time:

| Script | What it does |
| --- | --- |
| `pnpm run dev` | **Dev** server for `./templates/default` — Vite + SSR, HMR |
| `pnpm run preview` | **Production** build + static preview for `./templates/default` |

Typical workflows:

```bash
# Hack on the CLI / default theme (dev, hot reload)
pnpm install            # prepare builds dist/ automatically
pnpm run dev            # http://localhost:5173 (default starter site)

# Smoke-test production output for the default starter
pnpm run preview        # preactpress build templates/default && preactpress preview templates/default
```

Equivalent explicit CLI invocations:

```bash
node ./bin/preactpress.mjs dev templates/default
node ./bin/preactpress.mjs build templates/default && node ./bin/preactpress.mjs preview templates/default
```

## Optional starter templates

Init starters are packaged from `templates/default`, `templates/docs`, and `templates/magazine`. Keep those templates runnable after scaffolding and free of `node_modules`, `dist`, and workspace lockfiles.

## Example sites

The project website and larger magazine example live in the separate `../preactpress-examples` project. Use that project for site-specific deploys, screenshots, and example-site CI. Use this package repo for the CLI, default theme, and bundled init templates.

## Dev vs production styling

In **development**, PreactPress SSR renders the full layout into `#app`, but theme CSS normally lives in the client bundle (`import './styles.css'` in your `Layout.tsx`). Without extra handling, the browser would paint unstyled HTML until the module script runs.

PreactPress avoids that by collecting stylesheet URLs from the Vite client module graph (`preactpress/app` → layout → CSS) and injecting `<link rel="stylesheet">` tags into each dev HTML response (see `src/node/devCss.ts`).

In **production**, `preactpress build` extracts CSS into hashed files and `pageHtml` emits the same `<link rel="stylesheet">` tags in the static HTML head — the same shape as dev SSR for SEO and first paint.

A small inline script in the head restores `data-theme` from `localStorage` before paint when the user chose light/dark explicitly (`preactpress-theme`).

## Publishing to npm

To release the **CLI/tool** itself (not a content site), from the `preactpress` package directory:

```bash
pnpm install          # runs prepare → build (compiles TypeScript to dist/)
pnpm publish          # runs prepack → build automatically before pack
```

Requirements: Node 20+, npm account, and the `files` field in `package.json` (includes `dist`, `bin`, `templates`, etc.).

## Tests

```bash
pnpm test
```

Runs Vitest against the CLI and build pipeline.
