<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo-light.svg">
    <img src="./assets/logo-light.svg" alt="PreactPress" width="420" />
  </picture>
</p>

**PreactPress is the documentation framework for Preact libraries, APIs, and AI coding agents.**

<p align="center">
  <a href="https://www.npmjs.com/package/@kamod-ch/preactpress"><img src="https://img.shields.io/npm/v/@kamod-ch/preactpress" alt="npm version" /></a>
  <a href="https://github.com/kamod-ch/preactpress/actions/workflows/ci.yml"><img src="https://img.shields.io/npm/v/@kamod-ch/preactpress?label=node%2020%2C22%2C24" alt="Node support" /></a>
  <a href="https://github.com/kamod-ch/preactpress/actions/workflows/ci.yml"><img src="https://github.com/kamod-ch/preactpress/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/kamod-ch/preactpress/stargazers"><img src="https://img.shields.io/github/stars/kamod-ch/preactpress?style=social" alt="GitHub stars" /></a>
  <a href="https://github.com/kamod-ch/preactpress/blob/main/LICENSE"><img src="https://img.shields.io/github/license/kamod-ch/preactpress" alt="license" /></a>
</p>

**[Live demo](https://kamod-ch.github.io/preactpress/)** · **[Docs starter](./templates/docs)** · **[Showcase](./examples/showcase/)** · **[npm](https://www.npmjs.com/package/@kamod-ch/preactpress)** · **[GitHub](https://github.com/kamod-ch/preactpress)**

> If PreactPress saves you time, **[star the repo](https://github.com/kamod-ch/preactpress)** — it helps others discover the project.

## Key features

| Feature                       | What you get                                                           |
| ----------------------------- | ---------------------------------------------------------------------- |
| **Preact + MDX**              | VitePress-style docs with Preact components, not Vue                   |
| **Plugin system**             | Typed hooks for build, config, MDX, and validation                     |
| **`preactpress check`**       | CI-ready validation for links, routes, nav, redirects, and i18n        |
| **Documentation versioning**  | Version switcher, archived snapshots, scoped search                    |
| **Redirect system**           | HTTP redirects with HTML fallbacks and `_redirects` export             |
| **TypeDoc integration**       | `@preactpress/plugin-typedoc` for API reference pages                  |
| **Component props reference** | `@preactpress/plugin-component-reference` for MDX prop tables          |
| **Live Preact playground**    | `@preactpress/plugin-playground` with sandboxed MDX demos              |
| **AI-ready exports**          | `llms.txt`, `llms-full.txt`, per-page Markdown, and `api/context.json` |
| **Static output**             | Deploy `dist/` to any static host — no runtime server                  |

## Quick start

Requirements: **Node.js 20+** (tested on 20, 22, and 24).

```bash
pnpm dlx @kamod-ch/preactpress init my-docs --template docs
cd my-docs
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

Validate before release:

```bash
pnpm check
pnpm build
```

## Live demo

The canonical documentation site is built from [`templates/docs`](./templates/docs) and published at **[kamod-ch.github.io/preactpress](https://kamod-ch.github.io/preactpress/)**.

It demonstrates the default theme, local search, Mermaid diagrams, live playgrounds, AI exports, and a small German i18n demo.

## Code example

Minimal `.preactpress/config.ts`:

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { playgroundPlugin } from "@preactpress/plugin-playground";

export default defineConfig({
  site: {
    title: "My library",
    description: "API and component documentation",
    url: "https://docs.example.com",
  },
  plugins: [playgroundPlugin()],
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
  },
  themeConfig: {
    search: true,
    nav: [{ text: "Guide", link: "/guide/getting-started" }],
    sidebar: [
      {
        text: "Guide",
        items: [{ text: "Getting started", link: "/guide/getting-started" }],
      },
    ],
  },
});
```

Interactive MDX page:

```mdx
import Counter from "./components/Counter.tsx";

## Demo

<Counter initial={3} />
```

## Why PreactPress?

Many documentation tools assume Vue or React. PreactPress targets teams who already ship Preact libraries and want a smaller runtime with familiar JSX patterns.

- **Preact-first** — tiny bundle, React-like APIs, MDX components are Preact components.
- **VitePress-like DX** — file-based Markdown routes, sidebar, outline, search, and dark mode out of the box.
- **Library docs, not just guides** — TypeDoc, OpenAPI, component prop tables, and changelog plugins ship as first-class extensions.
- **AI agent ready** — static `llms.txt` / `llms-full.txt` exports help Cursor, Claude Code, and similar tools index your docs.
- **Static by default** — build once, deploy anywhere.

Pair with **[Kamod UI](https://ui.kamod.ch/)** for Preact + Tailwind components inside MDX pages.

## Comparison

|                         | PreactPress                             | VitePress              | Docusaurus                         | Starlight               |
| ----------------------- | --------------------------------------- | ---------------------- | ---------------------------------- | ----------------------- |
| UI stack                | Preact + MDX                            | Vue                    | React                              | Astro                   |
| Docs theme              | Built-in                                | Built-in               | Built-in                           | Built-in                |
| Runtime size            | Small Preact bundle                     | Vue hydration          | React + router                     | Varies                  |
| TypeScript API docs     | `@preactpress/plugin-typedoc`           | Manual / plugins       | TypeDoc plugin                     | Manual                  |
| Live code playground    | `@preactpress/plugin-playground`        | Custom                 | `@docusaurus/theme-live-codeblock` | Custom                  |
| AI exports (`llms.txt`) | Built-in                                | Community plugins      | Community plugins                  | Community plugins       |
| Doc validation CLI      | `preactpress check`                     | `vitepress build` only | `docusaurus build` only            | Astro build only        |
| Best for                | Preact libraries, APIs, AI-indexed docs | Vue documentation      | Large React doc portals            | Multi-framework content |

**Choose PreactPress** when you document Preact libraries or APIs and want VitePress-style workflows with MDX, plugins, validation, and AI-ready exports.

**Choose something else** when you need Vue (VitePress), a mature React plugin ecosystem (Docusaurus), or Astro's multi-framework island model (Starlight).

See the full [comparison guide](https://kamod-ch.github.io/preactpress/guide/comparison/) on the docs site.

## Templates

| Template         | Use case                                 | Scaffold                                                                 |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| `default`        | Minimal quick start                      | `pnpm dlx @kamod-ch/preactpress init my-site`                            |
| `docs`           | Full documentation (canonical reference) | `pnpm dlx @kamod-ch/preactpress init my-docs --template docs`            |
| `blog`           | Technical blog with RSS, tags, authors   | `pnpm dlx @kamod-ch/preactpress init my-blog --template blog`            |
| `product-docs`   | Product or library documentation         | `pnpm dlx @kamod-ch/preactpress init my-product --template product-docs` |
| `api-docs`       | JavaScript/TypeScript API reference      | `pnpm dlx @kamod-ch/preactpress init my-api --template api-docs`         |
| `saas-docs`      | SaaS onboarding and admin docs           | `pnpm dlx @kamod-ch/preactpress init my-saas --template saas-docs`       |
| `knowledge-base` | Help center and support articles         | `pnpm dlx @kamod-ch/preactpress init my-help --template knowledge-base`  |
| `versions`       | Multi-version documentation              | `pnpm dlx @kamod-ch/preactpress init my-versions --template versions`    |
| `monorepo`       | Docs inside a pnpm workspace             | `pnpm dlx @kamod-ch/preactpress init my-monorepo --template monorepo`    |
| `magazine`       | Custom editorial theme (demo)            | `pnpm dlx @kamod-ch/preactpress init my-mag --template magazine`         |
| `hono`           | Product landing + docs (demo)            | `pnpm dlx @kamod-ch/preactpress init my-site --template hono`            |

Browse the [template gallery](https://kamod-ch.github.io/preactpress/guide/templates/) or run `pnpm run dev:docs` from the package root while contributing.

## Plugins

Official plugins live under [`packages/`](./packages/) and are documented on the site:

| Plugin                                    | Purpose                                             |
| ----------------------------------------- | --------------------------------------------------- |
| `@preactpress/plugin-mermaid`             | Mermaid diagrams in Markdown                        |
| `@preactpress/plugin-playground`          | Live Preact sandboxes in MDX                        |
| `@preactpress/plugin-typedoc`             | TypeScript API reference from TypeDoc               |
| `@preactpress/plugin-component-reference` | Component prop tables in MDX                        |
| `@preactpress/plugin-openapi`             | REST API docs from OpenAPI 3.x                      |
| `@preactpress/plugin-changelog`           | Changelog pages from GitHub Releases or local files |

Register plugins in `.preactpress/config.ts`:

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { mermaidPlugin } from "@preactpress/plugin-mermaid";
import { typedocPlugin } from "@preactpress/plugin-typedoc";

export default defineConfig({
  plugins: [mermaidPlugin(), typedocPlugin({ tsconfig: "tsconfig.json", outDir: "api" })],
});
```

See [Plugins](https://kamod-ch.github.io/preactpress/guide/plugins/) and the [ecosystem gallery](https://kamod-ch.github.io/preactpress/guide/ecosystem/).

## Deployment

PreactPress emits static HTML, assets, search index, and optional AI exports. Deploy the `dist/` folder to any static host.

```bash
preactpress build
# For GitHub Pages project sites:
preactpress build --base /my-repo/
```

Supported patterns are documented for [Netlify](https://kamod-ch.github.io/preactpress/examples/netlify/), [Vercel](https://kamod-ch.github.io/preactpress/examples/vercel/), [Cloudflare Pages](https://kamod-ch.github.io/preactpress/examples/cloudflare-pages/), [GitHub Actions](https://kamod-ch.github.io/preactpress/examples/github-actions/), and [S3-compatible hosts](https://kamod-ch.github.io/preactpress/examples/s3-deploy/).

Official CI support: [`kamod-ch/preactpress/action@v2`](./action/README.md).

## Roadmap

Current priorities:

- Keep `templates/docs` synchronized with every public option and CLI behavior
- Expand real-world deployment and plugin examples
- Performance budgets for generated HTML, CSS, and client JavaScript
- Additional changelog providers (GitLab, Gitea)

Non-goals for core: production Node server runtime, Vue SFC support, full VitePress theme clone.

See [ROADMAP.md](./ROADMAP.md) and [RELEASE-REPORT.md](./RELEASE-REPORT.md) for the full release status.

## Contributing

Development scripts:

```bash
pnpm install
pnpm run build
pnpm test
pnpm run dev:docs
pnpm run check:docs
pnpm run build:docs
pnpm run verify    # fmt, lint, build, coverage, templates, browser, pack
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for package development. Upgrade from a previous release with [UPGRADE.md](./UPGRADE.md).

## License

Built by Klaus Zahiragic | Kamod GmbH

[Website](https://www.kamod.ch) · [LinkedIn](https://www.linkedin.com/in/klauszahiragic/)
