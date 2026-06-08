<p align="center">
  <img src="./assets/logo.svg" alt="PreactPress" width="420" />
</p>

# PreactPress

PreactPress is a Vite and Preact static site generator for Markdown and MDX. It produces static HTML and assets for documentation, product sites, blogs, and portfolios, with no Node server required in production.

## Quick start

Requirements: Node 20 or newer. pnpm is recommended; npm and yarn work too.

```bash
mkdir my-site && cd my-site
pnpm dlx preactpress init
pnpm install
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173).

For the complete documentation starter:

```bash
pnpm dlx preactpress init my-docs --template docs
```

## What is included

- file-based `.md` and `.mdx` routing
- development SSR and static production output
- Preact components in MDX
- default theme with responsive navigation, sidebar, outline, search, dark mode, tags, and i18n
- syntax highlighting, containers, alerts, code groups, includes, snippets, emoji, and optional math
- local search or Algolia DocSearch
- sitemap, robots, feeds, canonical URLs, Open Graph, and JSON-LD
- route rewrites, dynamic routes, content loaders, build hooks, and MPA mode
- `preactpress check` for routes, links, navigation, locales, and drafts

## Commands

| Command | Purpose |
| --- | --- |
| `preactpress init [dir]` | Scaffold a site |
| `preactpress dev [root]` | Start development |
| `preactpress check [root]` | Validate before release |
| `preactpress build [root]` | Generate static output |
| `preactpress preview [root]` | Preview the generated site |

Starter templates are `default`, `docs`, `magazine`, and `hono`.

## Minimal configuration

```ts
export default {
  site: {
    title: 'My docs',
    description: 'Product documentation',
    url: 'https://example.com'
  },
  themeConfig: {
    search: true,
    nav: [{ text: 'Guide', link: '/guide/getting-started' }],
    sidebar: [
      {
        text: 'Guide',
        items: [{ text: 'Getting started', link: '/guide/getting-started' }]
      }
    ]
  }
}
```

Every Markdown or MDX file below `srcDir` becomes a route unless it matches `srcExclude`.

## Documentation

The canonical, runnable documentation lives in [`templates/docs`](./templates/docs). It covers authoring, routing, i18n, the default theme, all configuration options, CLI validation, deployment, hooks, data loaders, dynamic routes, and custom themes.

Use these package scripts while contributing:

```bash
pnpm run build
pnpm test
pnpm run dev:docs
pnpm run check:docs
pnpm run build:docs
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for package development and [ROADMAP.md](./ROADMAP.md) for current priorities.

## License

MIT.
