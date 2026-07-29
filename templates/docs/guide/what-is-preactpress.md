---
title: What is PreactPress?
description: Learn what PreactPress is and when to use it
---

# What is PreactPress?

**PreactPress is the documentation framework for Preact libraries, APIs, and AI coding agents.**

You write pages in Markdown or MDX, configure navigation in `.preactpress/config.ts`, and PreactPress generates static HTML for any static host. The stack is [Vite](https://vite.dev/) + [Preact](https://preactjs.com/) — inspired by VitePress, but Preact and MDX instead of Vue.

## Use cases

### Library and API documentation

Document Preact component libraries, npm packages, and REST APIs with official plugins:

| Need                     | Plugin                                    |
| ------------------------ | ----------------------------------------- |
| TypeScript API reference | `@preactpress/plugin-typedoc`             |
| OpenAPI / REST docs      | `@preactpress/plugin-openapi`             |
| Component prop tables    | `@preactpress/plugin-component-reference` |
| Release notes            | `@preactpress/plugin-changelog`           |

### Interactive guides

Embed live Preact examples with `@preactpress/plugin-playground` and Mermaid diagrams with `@preactpress/plugin-mermaid`.

### AI coding agents

Enable `ai` exports to publish `llms.txt`, `llms-full.txt`, and `api/context.json` so tools like Cursor and Claude Code can index your docs. See [AI-ready documentation](/guide/ai-coding-tools).

### Multi-version docs

Maintain current and archived documentation with the version switcher. See [Documentation versioning](/guide/versioning).

## Developer experience

| Feature              | What it gives you                                                |
| -------------------- | ---------------------------------------------------------------- |
| Vite dev server      | Fast startup and hot updates while editing content               |
| Markdown frontmatter | Titles, descriptions, tags, drafts, and social metadata          |
| MDX                  | Preact components inside content pages                           |
| Default theme        | Nav, sidebar, outline, search, footer, locale switcher           |
| `preactpress check`  | Config, route, link, redirect, and nav validation before release |
| Plugin system        | Typed hooks for build, config, MDX, and validation               |

```mdx
import Counter from "./components/Counter.tsx";

## Demo

<Counter initial={3} />
```

## Performance

PreactPress produces static HTML for every route during the production build. After hydration, client-side navigation loads Markdown bodies as small JSON payloads from `preactpress-content/*.json`.

| Output                       | Purpose                             |
| ---------------------------- | ----------------------------------- |
| `index.html`, `*/index.html` | One HTML file per route             |
| `assets/*`                   | Hashed JavaScript and CSS from Vite |
| `preactpress-search.json`    | Search data for the default theme   |
| `llms.txt` / `llms-full.txt` | AI agent exports (when enabled)     |
| `_redirects`                 | HTTP redirects for static hosts     |

## How does PreactPress compare?

See the full [Comparison](/guide/comparison) against VitePress, Docusaurus, and Starlight.

**Choose PreactPress** when you document Preact libraries or APIs and want validation, plugins, and AI-ready exports in one framework.

**Choose VitePress** when you are committed to Vue.

## Next steps

| Page                                                                            | Why                                                      |
| ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Getting Started](/guide/getting-started)                                       | Install PreactPress and understand the starter structure |
| [Plugins](/guide/plugins)                                                       | Extend with official plugins                             |
| [Showcase](https://github.com/kamod-ch/preactpress/tree/main/examples/showcase) | Runnable feature demo                                    |
| [Deploy](/guide/deploy)                                                         | Build and publish a static site                          |
