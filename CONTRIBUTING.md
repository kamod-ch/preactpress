# Contributing to PreactPress

This guide is for people working on the **PreactPress CLI and package**, not for authors building content sites. If you only want to create a site, start with [README.md](./README.md). For planned features and priorities, see [ROADMAP.md](./ROADMAP.md).

## Monorepo

This repo lists `preactpress` in `pnpm-workspace.yaml`. Add `preactpress` as a devDependency (`workspace:*`) to consume the CLI from another package.

## Two different “build” commands

From the **package root** (`preactpress/`), two build concepts apply:

| Command | What it builds |
| --- | --- |
| `pnpm run build` | Compiles the **CLI** TypeScript sources to `dist/` (`tsc`). Does **not** build a content site. |
| `pnpm exec preactpress build [root]` | Runs the **static site generator** for a site (default: current directory). Writes HTML + assets to `outDir` (e.g. `template/dist/`). |

After changing CLI or client code, run `pnpm run build` before `pnpm run demo` or `node ./bin/preactpress.mjs …` so `dist/` is up to date. On `pnpm install`, the `prepare` script builds `dist/` automatically — you only need a manual build after editing sources.

From this directory: `pnpm install`, `pnpm run build`, then `./bin/preactpress.mjs --help` (or `pnpm exec preactpress` when linked from a workspace).

## Bundled demos

These scripts target starter sites without passing a path each time:

| Script | What it does |
| --- | --- |
| `pnpm run demo` | **Dev** server for `./template` — Vite + SSR, HMR |
| `pnpm run demo:preview` | **Production** build + static preview for `./template` |
| `pnpm run demo:magazine` | **Dev** server for `examples/magazine-starter` |
| `pnpm run demo:magazine:preview` | **Production** build + preview for the magazine example |

Typical workflows:

```bash
# Hack on the CLI / default theme (dev, hot reload)
pnpm install            # prepare builds dist/ automatically
pnpm run demo           # http://localhost:5173 (template site)

# Smoke-test production output for the template
pnpm run demo:preview   # preactpress build template && preactpress preview template

# Magazine example (custom theme under .preactpress/theme/)
pnpm run demo:magazine
pnpm run demo:magazine:preview
```

Equivalent explicit CLI invocations:

```bash
node ./bin/preactpress.mjs dev template
node ./bin/preactpress.mjs build template && node ./bin/preactpress.mjs preview template
```

## Magazine starter example

**Magazine starter** (`examples/magazine-starter/`): alternate layout (masthead, sticky nav, teaser grid in MDX, sidebar rail). From that directory run `pnpm install` and `pnpm exec preactpress dev`. The custom theme lives under `.preactpress/theme/` (see `theme/Layout.tsx` and `magazine.css`).

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

Requirements: Node 20+, npm account, and the `files` field in `package.json` (includes `dist`, `bin`, `template`, etc.).

## Tests

```bash
pnpm test
```

Runs Vitest against the CLI and build pipeline.
