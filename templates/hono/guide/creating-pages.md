---
title: Creating pages
description: Add new Markdown and MDX pages, understand URLs, and wire them into navigation
---

# Creating pages

PreactPress builds pages from files — there is no separate page editor or CMS. Every `.md` or `.mdx` file under the source directory (`srcDir`, default: project root) automatically becomes a public URL.

## Quick overview

1. Create a new file (e.g. `contact.md` or `guide/new-page.md`).
2. Optionally add frontmatter with `title`, `description`, and `layout`.
3. Write content in Markdown or MDX.
4. The dev server picks up changes automatically — no restart required.
5. Optionally add entries to `nav` and `sidebar` in `.preactpress/config.ts`.

## Step by step: a simple page

Create a Markdown file in the project root (or under `srcDir`), for example `contact.md`:

```md
---
title: Contact
description: How to reach us
layout: page
---

# Contact

Email us at **hello@example.com**.
```

Save the file — with `pnpm run dev` running, the page is immediately available at **/contact**.

> **Note**
> The file name (without extension) determines the URL path. `contact.md` → `/contact`, not `/contact.md`.

## File location → URL

PreactPress uses **file-based routing**. The path relative to `srcDir` becomes the route:

| File                 | URL                |
| -------------------- | ------------------ |
| `index.md`           | `/`                |
| `about.md`           | `/about`           |
| `guide/intro.md`     | `/guide/intro`     |
| `guide/index.md`     | `/guide`           |
| `news/2025/intro.md` | `/news/2025/intro` |
| `interactive.mdx`    | `/interactive`     |

Production builds write directory indexes (`dist/about/index.html`) so URLs work without `.html`.

More detail: [Routing](/guide/routing).

## Source directory (`srcDir`)

By default, Markdown files live in the project root next to `.preactpress/`. You can move content into a subfolder:

```ts
// .preactpress/config.ts
export default {
  srcDir: "docs",
};
```

Then all pages live under `docs/` — e.g. `docs/index.md` → `/`, `docs/guide/foo.md` → `/guide/foo`. URLs stay the same; only the file location changes.

## Frontmatter (optional but recommended)

YAML at the top of the file controls metadata and layout:

```md
---
title: My page
description: Short summary for search, SEO, and social previews
layout: doc
---
```

| Field          | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `title`        | Page title (nav, `<title>`, search)                        |
| `description`  | Summary for SEO and search                                 |
| `layout: doc`  | Docs layout with sidebar, outline, and previous/next links |
| `layout: page` | Content page without sidebar or doc outline                |
| `layout: home` | Home layout with optional `hero` and `features`            |
| `draft: true`  | Excluded from build, sitemap, and search                   |

Additional fields (`tags`, `sidebar: false`, `navbar: false`, …) are documented in the package README and starter reference.

## MDX pages with components

When you need interactive UI, use `.mdx` instead of `.md`:

```mdx
---
title: Demo
description: Interactive component
---

import Counter from "./components/Counter.tsx";

## Counter

<Counter initial={3} />
```

Import components relative to the MDX file. `##` and `###` headings feed the on-page outline (with `layout: doc`).

Example in this starter: [Interactive MDX](/interactive).

## Add to navigation

New pages do **not** appear in the header or sidebar automatically. Register them in `.preactpress/config.ts`:

```ts
export default {
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Contact", link: "/contact" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Creating pages", link: "/guide/creating-pages" },
          { text: "Contact", link: "/contact" },
        ],
      },
    ],
  },
};
```

For multilingual sites (`locales`), put `nav` and `sidebar` in each locale block — see [Getting Started](/guide/getting-started).

## Translated page (locale)

With locales configured, add translations in language folders:

```text
contact.md       -> /contact
de/contact.md    -> /de/contact
```

Each locale is a **separate file**, not an alias of the default page.

## Drafts and validation

- **`draft: true`** in frontmatter: visible in dev only, excluded from production builds.
- **`pnpm run check`**: validates missing links, unknown layouts, route collisions, and warns on drafts without descriptions.

## Common issues

| Problem               | Fix                                                                         |
| --------------------- | --------------------------------------------------------------------------- |
| Page returns 404      | `.md` / `.mdx` extension? File under `srcDir`? Dev server running?          |
| Markdown link broken  | Omit extension: `/guide/foo`, not `/guide/foo.md`                           |
| Duplicate URL         | Two files must not map to the same route (e.g. `foo.md` and `foo/index.md`) |
| Page missing from nav | Add to `nav` / `sidebar` in config                                          |

## Next steps

| Topic                      | Link                                              |
| -------------------------- | ------------------------------------------------- |
| First changes in 5 minutes | [Your first 5 minutes](/guide/first-five-minutes) |
| Routing, `srcDir`, tags    | [Routing](/guide/routing)                         |
| Markdown syntax            | [Markdown examples](/markdown-examples)           |
| Production build           | [Deploy](/guide/deploy)                           |
