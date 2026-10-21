---
title: Getting Started
description: Install PreactPress and start a new documentation site
---

# Getting Started

This guide shows how to create a PreactPress site, understand the generated files, and start the development server.

## Prerequisites

You need:

| Requirement     | Version                                         |
| --------------- | ----------------------------------------------- |
| Node.js         | 20 or higher (20, 22, 24 tested in CI)          |
| Package manager | pnpm recommended; npm, yarn, and bun also work  |
| Editor          | Any editor with Markdown and TypeScript support |

## Create a site

Start in an empty directory:

```bash
mkdir my-site
cd my-site
pnpm dlx @kamod-ch/preactpress init
pnpm install
pnpm run dev
```

With npm:

```bash
mkdir my-site
cd my-site
npx @kamod-ch/preactpress init
npm install
npm run dev
```

Open **http://localhost:5173** to see the starter site.

> **Note**
> `preactpress init` copies the built-in starter template and writes `@kamod-ch/preactpress` to `devDependencies`. You do not need to install PreactPress separately before running the initializer.

Not sure which starter to use? Compare all eleven official options on [Starter templates](/guide/templates).

## File structure

After initialization, the project looks like this:

```text
my-site/
├── README.md
├── index.html
├── index.md
├── guide/
│   └── first-five-minutes.md
├── markdown-examples.md
├── interactive.mdx
├── components/
│   └── Counter.tsx
└── .preactpress/
    └── config.ts
```

The `.preactpress` directory contains site configuration. Markdown and MDX files outside `.preactpress` are source files and become routes.

## The config file

The starter config lives at `.preactpress/config.ts`:

```ts
export default {
  site: {
    title: "My Docs",
    description: "Short summary for search and social previews",
  },
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/what-is-preactpress" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is PreactPress?", link: "/guide/what-is-preactpress" },
          { text: "Getting Started", link: "/guide/getting-started" },
        ],
      },
    ],
  },
};
```

Use `site` for site-wide metadata and `themeConfig` for default-theme options such as logo (`logo: '/logo.svg'`), nav, sidebar, search, outline, footer, and edit links.

## Source files

PreactPress uses file-based routing. By default, the source directory is the project root:

```text
index.md                  -> /
guide/getting-started.md  -> /guide/getting-started
interactive.mdx           -> /interactive
```

You can change the source directory with `srcDir`:

```ts
export default {
  srcDir: "docs",
};
```

With this config, PreactPress reads pages from `docs/` while `.preactpress/config.ts` still belongs to the project root.

## Commands

The starter includes npm scripts:

| Command            | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `pnpm run dev`     | Start the dev server with SSR and hot reload  |
| `pnpm run check`   | Validate config, routes, and links            |
| `pnpm run build`   | Build the static production site into `dist/` |
| `pnpm run preview` | Preview the production build locally          |

You can also call the CLI directly:

```bash
pnpm exec preactpress dev
pnpm exec preactpress check
pnpm exec preactpress build
pnpm exec preactpress preview
```

### PreactPress repository contributors

If you clone [github.com/kamod-ch/preactpress](https://github.com/kamod-ch/preactpress) and work on `templates/docs` here, the root package does not expose `pnpm exec preactpress`. Use `pnpm run dev:docs`, `pnpm run build:docs`, and `pnpm run preactpress -- preview templates/docs` from the repository root instead.

This starter depends on the core package via `file:../..`. After `pnpm run build` at the root, run `pnpm run link:templates/docs` (or `pnpm install` in this folder) so installs pick up the latest `dist/` output. Details: [Contributing — Documentation site](https://github.com/kamod-ch/preactpress/blob/main/CONTRIBUTING.md#documentation-site-templatesdocs).

## What's next?

| Page                                              | Why                                               |
| ------------------------------------------------- | ------------------------------------------------- |
| [Your first 5 minutes](/guide/first-five-minutes) | Change the title, add a page, and wire navigation |
| [Routing](/guide/routing)                         | Learn how Markdown files map to URLs              |
| [Deploy](/guide/deploy)                           | Build and publish the generated `dist/` directory |
