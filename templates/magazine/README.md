# PreactPress Magazine Starter

An editorial starter for PreactPress with a custom magazine theme, article teasers, tags, and a content-loader driven home page.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command        | Purpose                      |
| -------------- | ---------------------------- |
| `pnpm dev`     | Start the development server |
| `pnpm check`   | Validate routes and links    |
| `pnpm build`   | Generate static output       |
| `pnpm preview` | Preview the static build     |

## What to edit

- `.preactpress/config.ts` configures the site title, theme, sidebar, and footer.
- `.preactpress/theme/` contains the custom magazine layout and styles.
- `index.data.ts` loads article frontmatter for the home page teaser grid.
- `article-*.md(x)` files are example articles.

Set `site.url` and `site.base` in `.preactpress/config.ts` before deploying to a production host.
