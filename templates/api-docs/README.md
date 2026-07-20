# API documentation starter

Reference-style starter for documenting a JavaScript or TypeScript API with PreactPress.

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

## Installation

```bash
pnpm dlx @kamod-ch/preactpress init my-site --template api-docs
cd my-site
pnpm install
```

## Development

```bash
pnpm run dev
```

Open **http://localhost:5173**.

## Production build

```bash
pnpm run build
pnpm run preview
```

## Directory structure

```text
.preactpress/config.ts   Site and theme configuration
index.md                 Home page
**/                     Content pages (Markdown / MDX)
public/                  Static assets
```

## Add content

Create `.md` or `.mdx` files anywhere under the content root. Wire navigation in `.preactpress/config.ts` under `themeConfig.nav` and `themeConfig.sidebar`.

## Branding

Edit `site.title`, `site.description`, and `themeConfig.logo` in `.preactpress/config.ts`. Colors follow the default theme CSS custom properties (`--pp-*`).

## Deployment

Set `site.url` to your production URL before building. See [Deploy guide](https://kamod-ch.github.io/preactpress/guide/deploy) in the PreactPress docs.

## PreactPress features used

- Default documentation theme with sidebar, search, and outline
- Markdown callouts, code blocks with syntax highlighting
- Static sitemap and search index
- Dark mode via theme toggle
