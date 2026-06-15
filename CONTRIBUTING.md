# Contributing to PreactPress

This guide is for people working on the **PreactPress CLI and package**, not for authors building content sites. If you only want to create a site, start with [README.md](./README.md). For planned features and priorities, see [ROADMAP.md](./ROADMAP.md).

## Monorepo

This repo publishes `@kamod-ch/preactpress` on npm. Add `@kamod-ch/preactpress` as a devDependency (`workspace:*` in a monorepo, or a semver range from npm) to consume the CLI from another package.

## Two different “build” commands

From the **package root** (`preactpress/`), two build concepts apply:

| Command                              | What it builds                                                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run build`                     | Compiles the **CLI** TypeScript sources to `dist/` (`tsc`). Does **not** build a content site.                                                 |
| `pnpm exec preactpress build [root]` | Runs the **static site generator** for a site (default: current directory). Writes HTML + assets to `outDir` (e.g. `templates/default/dist/`). |

After changing CLI or client code, run `pnpm run build` before `pnpm run dev` or `node ./bin/preactpress.mjs …` so `dist/` is up to date. On `pnpm install`, the `prepare` script builds `dist/` automatically — you only need a manual build after editing sources.

From this directory: `pnpm install`, `pnpm run build`, then `./bin/preactpress.mjs --help` (or `pnpm exec preactpress` when linked from a workspace).

## Bundled demos

These scripts target the bundled minimal starter without passing a path each time:

| Script             | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `pnpm run dev`     | **Dev** server for `./templates/default` — Vite + SSR, HMR      |
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

Init starters are packaged from `templates/default`, `templates/docs`, `templates/magazine`, and `templates/hono`. Keep those templates runnable after scaffolding and free of `node_modules`, `dist`, and workspace lockfiles.

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
pnpm test
npm publish           # runs prepack → build automatically before pack
```

Requirements:

- Node 20+
- npm account with access to the `@kamod-ch` organization
- `publishConfig.access` set to `public` in `package.json` (scoped packages default to private)
- the `files` field in `package.json` (includes `dist`, `bin`, `templates`, etc.)

Verify the tarball before the first release:

```bash
npm pack --dry-run
```

Tag-driven releases are automated via `.github/workflows/publish.yml` when you push a `v*` tag (for example `v1.0.1`). Set the `NPM_TOKEN` repository secret first.

## Lint and format

PreactPress uses [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) (not ESLint/Prettier).

```bash
pnpm run lint        # oxlint
pnpm run lint:fix    # oxlint with auto-fix
pnpm run fmt         # format the repo
pnpm run fmt:check   # verify formatting (CI)
```

Configuration lives in `.oxlintrc.json` and `.oxfmtrc.json` at the package root. Scope includes `src/`, `tests/`, and `templates/`.

## Tests

```bash
pnpm test              # Vitest unit/integration tests
pnpm run test:coverage # Vitest with coverage thresholds
pnpm run test:browser  # Playwright mobile drawer/search checks
```

Vitest covers the CLI, build pipeline, Markdown processing, and shared helpers. Playwright builds and previews the docs starter, then verifies the default theme's mobile drawer focus behavior and local search.
