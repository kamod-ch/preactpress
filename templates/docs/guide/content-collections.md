---
title: Content collections
description: Typed, schema-validated content loaders for markdown and MDX with build-time queries.
---

PreactPress content collections validate frontmatter with [Zod](https://zod.dev), resolve relationships between collections, and run entirely at build time. Loader output is attached to `page.meta.contentData` for the matching route — nothing ships to the client unless your theme reads that data.

## Define a collection

Register collections in `content.config.ts` (or any `*.collection.ts` file) under your site `srcDir`:

```ts
import { defineCollection, z } from "@kamod-ch/preactpress/content";

export const guides = defineCollection({
  directory: "content/guides",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    order: z.number().default(0),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    date: z.coerce.date().optional(),
  }),
  sort: "order:asc",
});
```

Each export name becomes the collection id (`guides` above).

### Markdown and MDX

Collections scan `.md` and `.mdx` files. Use either:

- `directory: "posts"` — globs `posts/**/*.{md,mdx}`
- `patterns: ["article-*.{md,mdx}"]` — custom globs relative to `srcDir`

## Query at build time

Colocate a `*.data.ts` module with the page that should receive the data:

```ts
import { loadCollection } from "@kamod-ch/preactpress/content";

export default loadCollection("guides", {
  sort: "order:asc",
  filter: { category: "getting-started" },
  transform(entries) {
    return entries.map((entry) => ({
      title: entry.data.title,
      route: entry.route,
      description: entry.data.description,
    }));
  },
});
```

`loadCollection` returns a build-time loader token (like `createContentLoader`). PreactPress resolves it during `preactpress build` and `preactpress check`.

## Sorting and filtering

| Sort preset  | Behavior                            |
| ------------ | ----------------------------------- |
| `route:asc`  | Route path A→Z (default)            |
| `route:desc` | Route path Z→A                      |
| `date:asc`   | Oldest `date` / `publishedAt` first |
| `date:desc`  | Newest first                        |
| `order:asc`  | Lowest numeric `order` first        |
| `order:desc` | Highest `order` first               |

Pass `filter: { category: "news" }` to keep entries whose validated `data` matches every key.

## Drafts and publish dates

Entries with `draft: true` or a future `date` / `publishedAt` / `publishDate` are excluded unless you pass `includeDrafts: true` to `loadCollection` or set `includeDrafts: true` on the collection definition.

## Cross-collection references

Link entries across collections with the `reference()` helper or a `references` map:

```ts
import { defineCollection, reference, z } from "@kamod-ch/preactpress/content";

export const authors = defineCollection({
  directory: "authors",
  schema: z.object({ name: z.string(), slug: z.string().optional() }),
});

export const posts = defineCollection({
  directory: "posts",
  schema: z.object({
    title: z.string(),
    author: reference("authors"),
  }),
  references: { author: "authors" },
});
```

Frontmatter stores the referenced entry id (`author: alex`). At build time the field becomes a resolved object with `id`, `route`, `url`, and `data`.

## Preset collections

Import ready-made schemas for common starters:

| Preset                            | Use case                           |
| --------------------------------- | ---------------------------------- |
| `blogPostsCollection`             | Blog posts under `posts/`          |
| `knowledgeBaseArticlesCollection` | KB articles in topic folders       |
| `changelogEntriesCollection`      | Changelog pages under `changelog/` |
| `magazineArticlesCollection`      | Root-level `article-*.md(x)` files |
| `authorsCollection`               | Author profiles for references     |

```ts
import { blogPostsCollection } from "@kamod-ch/preactpress/content";

export const posts = blogPostsCollection;
```

## Validation errors

Invalid frontmatter fails the build with the source file and field path:

```text
preactpress: Invalid frontmatter in posts/my-post.md
  → description: Required
  → title: Expected string, received number
```

## Legacy content loaders

`createContentLoader` from `@kamod-ch/preactpress/config` remains supported. Migrate route-by-route to collections when you need schema validation, references, or shared presets. Existing glob loaders continue to work unchanged.

## Related

- [Advanced APIs](/guide/advanced) — hooks and legacy loaders
- [Configuration](/guide/configuration) — frontmatter and page metadata
- Blog starter — `content.config.ts` + `loadCollection("posts")` example
