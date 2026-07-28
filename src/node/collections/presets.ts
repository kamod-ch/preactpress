import { z } from "zod";
import { defineCollection } from "./defineCollection.js";

const authorSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    slug: z.string().optional(),
    avatar: z.string().optional(),
  }),
]);

const categorySchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    slug: z.string().optional(),
  }),
]);

/** Blog posts under `posts/` with editorial metadata and taxonomies. */
export const blogPostsCollection = defineCollection({
  directory: "posts",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: authorSchema.optional(),
    category: categorySchema.optional(),
    readTime: z.string().optional(),
    date: z.coerce.date().optional(),
    lastUpdated: z.coerce.date().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    layout: z.enum(["doc", "page", "home"]).optional(),
    outline: z.boolean().optional(),
  }),
  sort: "date:desc",
});

/** Knowledge-base articles grouped by folder with optional popularity and ordering. */
export const knowledgeBaseArticlesCollection = defineCollection({
  patterns: [
    "getting-started/**/*.{md,mdx}",
    "account/**/*.{md,mdx}",
    "privacy/**/*.{md,mdx}",
    "troubleshooting/**/*.{md,mdx}",
  ],
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    popular: z.boolean().optional(),
    order: z.number().default(0),
    draft: z.boolean().optional(),
    date: z.coerce.date().optional(),
    layout: z.enum(["doc", "page", "home"]).optional(),
  }),
  sort: "order:asc",
});

/** Changelog releases generated under `changelog/` by `@preactpress/plugin-changelog`. */
export const changelogEntriesCollection = defineCollection({
  directory: "changelog",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    version: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
  sort: "date:desc",
});

/** Magazine feature articles (`article-*.md`) with editorial metadata. */
export const magazineArticlesCollection = defineCollection({
  patterns: ["article-*.{md,mdx}"],
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: authorSchema.optional(),
    category: categorySchema.optional(),
    readTime: z.string().optional(),
    date: z.coerce.date().optional(),
    draft: z.boolean().optional(),
    layout: z.enum(["doc", "page", "home"]).optional(),
  }),
  sort: "date:desc",
});

/** Author profiles for cross-collection references. */
export const authorsCollection = defineCollection({
  directory: "authors",
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  }),
  sort: "route:asc",
});
