# PreactPress documentation starter

This is the canonical PreactPress documentation and the site created by `preactpress init --template docs`.

## Commands

| Script             | Purpose                                 |
| ------------------ | --------------------------------------- |
| `pnpm run dev`     | Start the docs at http://localhost:5173 |
| `pnpm run check`   | Validate routes, config, and links      |
| `pnpm run build`   | Generate static output in `dist/`       |
| `pnpm run preview` | Preview the production output locally   |

## Structure

- English pages are the complete, maintained reference.
- `de/` is a deliberately small i18n demonstration.
- `partials/` and `parts/` contain included fragments and are excluded from routes.
- `.preactpress/config.ts` defines navigation, locales, Markdown features, and build behavior.

Set `site.url` and, when needed, `site.base` before production deployment. Upload `dist/` only.
