# PreactPress documentation starter

This is the canonical PreactPress documentation and the site created by `preactpress init --template docs`.

## Commands

| Script             | Purpose                                 |
| ------------------ | --------------------------------------- |
| `pnpm run dev`     | Start the docs at http://localhost:5173 |
| `pnpm run check`   | Validate routes, config, and links      |
| `pnpm run build`   | Generate static output in `dist/`       |
| `pnpm run preview` | Preview the production output locally   |

From the **monorepo root** (while hacking on PreactPress itself), prefer `pnpm run dev:docs`, `pnpm run build:docs`, and `pnpm run preactpress -- preview templates/docs` — the root package does not install the `preactpress` CLI into its own `node_modules/.bin`.

This folder uses `"@kamod-ch/preactpress": "file:../.."`. After rebuilding the core package at the repo root, run **`pnpm run link:templates/docs`** once (from the root) or `pnpm install` here so `node_modules` sees the latest `dist/` output. See [Contributing](https://github.com/kamod-ch/preactpress/blob/main/CONTRIBUTING.md#documentation-site-templatesdocs) in the main repository.

## Structure

- English pages are the complete, maintained reference.
- `de/` is a deliberately small i18n demonstration.
- `partials/` and `parts/` contain included fragments and are excluded from routes.
- `.preactpress/config.ts` defines navigation, locales, Markdown features, and build behavior.

Set `site.url` and, when needed, `site.base` before production deployment. Upload `dist/` only.
