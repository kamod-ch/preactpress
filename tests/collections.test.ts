import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defineCollection, z } from "../src/node/collections/defineCollection.js";
import {
  collectionGlobPatterns,
  entryIdFromFile,
  isDraftEntry,
  isScheduledEntry,
  loadCollectionEntries,
  matchesFilter,
} from "../src/node/collections/loadEntries.js";
import { resolveSortComparator } from "../src/node/collections/sort.js";
import { CollectionValidationError } from "../src/node/collections/validation.js";
import type { SiteConfig } from "../src/node/siteConfig.js";

function tempSite(root: string, srcDir: string): SiteConfig {
  return {
    root,
    srcDir,
    site: { title: "Test", description: "Test", base: "/" },
    themeConfig: {},
    srcExclude: [],
    cacheDir: path.join(root, ".cache"),
    outDir: path.join(root, "dist"),
    logger: console,
    versions: { versions: [] },
    i18n: { locales: ["en"], defaultLocale: "en" },
    workspaces: { workspaces: [] },
  } as SiteConfig;
}

describe("collections", () => {
  const cleanup: string[] = [];

  afterEach(async () => {
    await Promise.all(cleanup.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
  });

  it("builds glob patterns from directory or custom patterns", () => {
    expect(
      collectionGlobPatterns(
        defineCollection({
          directory: "guides",
          schema: z.object({ title: z.string() }),
        }),
      ),
    ).toEqual(["guides/**/*.{md,mdx}"]);

    expect(
      collectionGlobPatterns(
        defineCollection({
          patterns: ["article-*.{md,mdx}"],
          schema: z.object({ title: z.string() }),
        }),
      ),
    ).toEqual(["article-*.{md,mdx}"]);
  });

  it("derives stable entry ids from collection paths", () => {
    const def = defineCollection({
      directory: "posts",
      schema: z.object({ title: z.string() }),
    });
    expect(entryIdFromFile(def, "/site/src", "/site/src/posts/hello-world.md")).toBe("hello-world");
    expect(entryIdFromFile(def, "/site/src", "/site/src/posts/nested/index.md")).toBe("nested");
  });

  it("detects drafts and future publish dates", () => {
    expect(isDraftEntry({ draft: true })).toBe(true);
    expect(isDraftEntry({ draft: false })).toBe(false);
    expect(isScheduledEntry({ date: "2099-01-01" })).toBe(true);
    expect(isScheduledEntry({ date: "2020-01-01" })).toBe(false);
  });

  it("filters validated entry data by field equality", () => {
    expect(matchesFilter({ category: "guides", order: 1 }, { category: "guides" })).toBe(true);
    expect(matchesFilter({ category: "guides" }, { category: "blog" })).toBe(false);
  });

  it("sorts entries by date descending", () => {
    const sort = resolveSortComparator("date:desc");
    const entries = [
      {
        id: "a",
        route: "/a",
        relativePath: "a.md",
        file: "/a.md",
        url: "/a",
        data: { date: new Date("2024-01-01") },
      },
      {
        id: "b",
        route: "/b",
        relativePath: "b.md",
        file: "/b.md",
        url: "/b",
        data: { date: new Date("2025-01-01") },
      },
    ];
    expect(entries.sort(sort).map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  it("validates frontmatter and reports file plus field errors", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "pp-collections-"));
    cleanup.push(root);
    const srcDir = path.join(root, "src");
    await fs.mkdir(path.join(srcDir, "guides"), { recursive: true });
    await fs.writeFile(
      path.join(srcDir, "guides", "broken.md"),
      "---\ntitle: 42\n---\n\n# Broken\n",
      "utf8",
    );

    const guides = defineCollection({
      directory: "guides",
      schema: z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        order: z.number().default(0),
      }),
    });

    await expect(loadCollectionEntries(guides, tempSite(root, srcDir))).rejects.toBeInstanceOf(
      CollectionValidationError,
    );

    try {
      await loadCollectionEntries(guides, tempSite(root, srcDir));
    } catch (error) {
      expect(error).toBeInstanceOf(CollectionValidationError);
      const validationError = error as CollectionValidationError;
      expect(validationError.file).toContain("guides/broken.md");
      expect(validationError.message).toContain("title");
      expect(validationError.message).toContain("description");
    }
  });

  it("loads markdown and mdx entries with defaults, filtering, and draft exclusion", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "pp-collections-"));
    cleanup.push(root);
    const srcDir = path.join(root, "src");
    await fs.mkdir(path.join(srcDir, "guides"), { recursive: true });

    await fs.writeFile(
      path.join(srcDir, "guides", "first.md"),
      "---\ntitle: First\ndescription: One\ncategory: alpha\n---\n\n# First\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(srcDir, "guides", "second.mdx"),
      "---\ntitle: Second\ndescription: Two\ncategory: beta\norder: 2\n---\n\n# Second\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(srcDir, "guides", "draft.md"),
      "---\ntitle: Draft\ndescription: Hidden\ncategory: alpha\ndraft: true\n---\n\n# Draft\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(srcDir, "guides", "future.md"),
      "---\ntitle: Future\ndescription: Later\ncategory: alpha\ndate: 2099-06-01\n---\n\n# Future\n",
      "utf8",
    );

    const guides = defineCollection({
      directory: "guides",
      schema: z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        order: z.number().default(0),
        draft: z.boolean().optional(),
        date: z.coerce.date().optional(),
      }),
      sort: "order:asc",
    });

    const all = await loadCollectionEntries(guides, tempSite(root, srcDir));
    expect(all.map((entry) => entry.id)).toEqual(["first", "second"]);

    const filtered = await loadCollectionEntries(guides, tempSite(root, srcDir), {
      filter: { category: "beta" },
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.data.title).toBe("Second");

    const withDrafts = await loadCollectionEntries(guides, tempSite(root, srcDir), {
      includeDrafts: true,
    });
    expect(withDrafts.map((entry) => entry.id).sort()).toEqual(["draft", "first", "future", "second"]);
  });

  it("resolves cross-collection references at build time", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "pp-collections-"));
    cleanup.push(root);
    const srcDir = path.join(root, "src");
    await fs.mkdir(path.join(srcDir, "authors"), { recursive: true });
    await fs.mkdir(path.join(srcDir, "posts"), { recursive: true });

    await fs.writeFile(
      path.join(srcDir, "authors", "alex.md"),
      "---\nname: Alex\nslug: alex\n---\n\n# Alex\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(srcDir, "posts", "hello.md"),
      "---\ntitle: Hello\nauthor: alex\n---\n\n# Hello\n",
      "utf8",
    );

    const authors = defineCollection({
      directory: "authors",
      schema: z.object({
        name: z.string(),
        slug: z.string().optional(),
      }),
    });

    const posts = defineCollection({
      directory: "posts",
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      references: { author: "authors" },
    });

    const authorEntries = await loadCollectionEntries(authors, tempSite(root, srcDir));
    const authorMap = new Map([
      ["authors", new Map(authorEntries.map((entry) => [entry.id, entry]))],
    ]);

    const postEntries = await loadCollectionEntries(posts, tempSite(root, srcDir), {}, authorMap);
    const authorRef = (postEntries[0]?.data as { author: { id: string; data: { name: string } } })
      .author;

    expect(authorRef.id).toBe("alex");
    expect(authorRef.data.name).toBe("Alex");
  });
});
