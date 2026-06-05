# PreactPress starter site

This folder was scaffolded with `preactpress init`. It is the minimal starter: a home page, an about page, and one short guide.

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
| `.preactpress/config.ts` | Site title, nav, sidebar, build options |
| `index.html` | Vite entry (rarely edited) |

## Layout examples

The default starter shows all built-in default-theme layouts:

| File | Layout |
| --- | --- |
| `index.md` | `layout: home` |
| `about.md` | `layout: page` |
| `guide/first-five-minutes.md` | `layout: doc` |

Start with [Your first 5 minutes](/guide/first-five-minutes) in the local site, or read the full PreactPress README in the npm package / repository.

For a larger documentation starter, run `preactpress init --template docs`. For a custom magazine-style theme, run `preactpress init --template magazine`.

## Deploy

```bash
pnpm run check
pnpm run build
```

Upload **only** `dist/` to Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any static host. No Node server is required in production.

Before the first production build, set `site.url` (and `site.base` for subpath hosting) in `.preactpress/config.ts`.
