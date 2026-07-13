---
title: CLI and validation
description: Commands for scaffolding, development, validation, builds, and previews.
---

Run commands from the site root or pass a root path as the final argument.

| Command                                      | Purpose                                             |
| -------------------------------------------- | --------------------------------------------------- |
| `preactpress init [dir]`                     | Scaffold the minimal starter                        |
| `preactpress init [dir] --template docs`     | Scaffold the full documentation starter             |
| `preactpress init [dir] --template magazine` | Scaffold a custom editorial theme                   |
| `preactpress init [dir] --template hono`     | Scaffold a product/docs custom theme                |
| `preactpress dev [root]`                     | Start Vite SSR and hot reload                       |
| `preactpress check [root]`                   | Validate config, routes, links, locales, and drafts |
| `preactpress build [root]`                   | Emit static production files                        |
| `preactpress preview [root]`                 | Serve `outDir` locally                              |

See [Starter templates](/guide/templates) for a comparison of the four official init starters.

## Recommended workflow

```bash
pnpm run dev
pnpm run check
pnpm run build
pnpm run preview
```

Add `check` and `build` to CI. `preview` is a local smoke-test server, not a production runtime.

## What check validates

- configuration loading
- route collisions and a root page
- nav and sidebar destinations
- relative and root-relative Markdown links
- locale roots and locale-specific navigation
- generated tag routes
- invalid page layouts and misplaced home frontmatter
- drafts and missing descriptions as warnings

Use `ignoreDeadLinks` only for intentional external or generated destinations.
