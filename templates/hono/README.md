# PreactPress Hono-style starter site

This folder was scaffolded with `preactpress init --template hono`.

It combines a hono.dev-inspired landing page with a full documentation starter, MDX examples, and an English/German i18n demo.

## Commands

| Script | What it does |
| --- | --- |
| `pnpm run dev` | Start the dev server at http://localhost:5173 |
| `pnpm run check` | Validate config, routes, and links |
| `pnpm run build` | Write static HTML to `dist/` |
| `pnpm run preview` | Serve the production build locally |

## Where to edit

| Path | Purpose |
| --- | --- |
| `*.md`, `*.mdx` | Page content — file path becomes the URL |
| `index.mdx`, `de/index.mdx` | Landing pages with the hero and feature cards |
| `de/*.md`, `de/*.mdx` | German pages for the bundled i18n demo |
| `.preactpress/config.ts` | Site title, nav, sidebar, locales, build options |
| `.preactpress/theme/` | Custom Hono-style layout, components, and CSS |
| `components/` | Preact components for MDX pages |
| `index.html` | Vite entry (rarely edited) |

Start with [Your first 5 minutes](/guide/first-five-minutes) in the local site, or read the full PreactPress README in the npm package / repository.

This starter includes English pages at the root and German pages under `/de/`. Remove the `de/` folder and `locales` config if you want a single-language site.

## Deploy

```bash
pnpm run check
pnpm run build
```

Upload **only** `dist/` to Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any static host. No Node server is required in production.

Before the first production build, set `site.url` (and `site.base` for subpath hosting) in `.preactpress/config.ts`.
