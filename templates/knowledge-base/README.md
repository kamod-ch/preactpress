# Knowledge base starter

Support and help center starter with search-first UX, categories, and realistic help articles.

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

## Installation

```bash
pnpm dlx @kamod-ch/preactpress init my-site --template knowledge-base
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

## PreactPress monorepo

From the repository root: `pnpm run dev:knowledge-base`, `pnpm run build:knowledge-base`. After rebuilding the core package, link it with `node ./scripts/link-local-preactpress.mjs templates/knowledge-base` ([Contributing](https://github.com/kamod-ch/preactpress/blob/main/CONTRIBUTING.md#documentation-site-templatesdocs)).

## Directory structure

```text
.preactpress/config.ts   Site and theme configuration
index.mdx                Search-first help center home
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
