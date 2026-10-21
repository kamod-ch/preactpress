# PreactPress Blog starter

Technical blog starter with RSS, tags, authors, content-loader teasers, and a custom engineering theme.

## Prerequisites

- Node.js 20+
- pnpm (recommended)

## Installation

```bash
pnpm dlx @kamod-ch/preactpress init my-blog --template blog
cd my-blog
pnpm install
```

## Development

```bash
pnpm run dev
```

## Production build

```bash
pnpm run build
```

Outputs static HTML, `sitemap.xml`, `robots.txt`, and `feed.xml` (requires `site.url`).

## PreactPress monorepo

From the repository root: `pnpm run dev:blog`, `pnpm run build:blog`. After rebuilding the core package, link it with `node ./scripts/link-local-preactpress.mjs templates/blog` ([Contributing](https://github.com/kamod-ch/preactpress/blob/main/CONTRIBUTING.md#documentation-site-templatesdocs)).

## Directory structure

```text
posts/                   Blog articles (.md / .mdx)
index.mdx                Home page
index.data.ts            Content loader for teaser grid
articles.md              Article index
authors.md               Author listing
.preactpress/
  config.ts              Site config, RSS, navigation
  theme/                 Custom engineering-blog layout
public/                  Static assets (OG images)
```

## Frontmatter fields

See `FRONTMATTER.md` for documented article fields: `title`, `description`, `tags`, `author`, `category`, `readTime`, `date`, `lastUpdated`, `image`, `layout`, `outline`.

## Add a post

Create `posts/my-post.md` with frontmatter. Posts appear in the home teaser grid, RSS feed, and tag index automatically.

## Navigation

Edit `themeConfig.nav` and `themeConfig.sidebar` in `.preactpress/config.ts`.

## Branding

Update `site.title`, theme CSS in `.preactpress/theme/blog.css`, and header copy in `Layout.tsx`.

## Deployment

Set `site.url` to your production domain before building.

## PreactPress features

- Custom theme with dark mode toggle
- Content loader (`createContentLoader`)
- Tag index pages
- RSS / Atom feed
- Sitemap and Open Graph metadata
- Syntax-highlighted code blocks
- Table of contents on long posts
