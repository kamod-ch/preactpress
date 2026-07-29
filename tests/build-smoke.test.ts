import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "../src/node/build.js";
import { init } from "../src/node/init.js";

describe("build smoke", () => {
  it("builds the minimal starter site with assets and 404 output", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-build-"));
    try {
      await init(root);
      await build(root);

      const index = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
      const about = await fs.readFile(path.join(root, "dist", "about", "index.html"), "utf8");
      const guide = await fs.readFile(
        path.join(root, "dist", "guide", "first-five-minutes", "index.html"),
        "utf8",
      );
      const notFound = await fs.readFile(path.join(root, "dist", "404.html"), "utf8");

      expect(index).toContain('<div id="app">');
      expect(index).toContain('<html lang="en">');
      expect(index).toContain('property="og:title"');
      expect(index).toContain('name="description"');
      expect(index).toContain('type="module"');
      expect(index).toContain('rel="stylesheet"');
      expect(index).toContain('href="/favicon.svg"');
      expect(index).toContain('class="pp-home-hero"');
      expect(index).toContain('class="pp-home-features"');
      expect(index).not.toContain('class="pp-sidebar"');
      expect(about).toContain("About us");
      expect(about).toContain('class="pp-doc-content-plain"');
      expect(about).not.toContain('class="pp-sidebar"');
      expect(guide).toContain("Your first 5 minutes");
      expect(guide).toContain('class="pp-sidebar"');
      expect(guide).toContain('class="pp-menu-toggle"');
      expect(guide).toContain('aria-controls="pp-mobile-drawer"');
      expect(guide).toContain('id="pp-mobile-drawer"');
      expect(guide).toContain('aria-label="Close menu"');
      const themeScript = await fs.readFile(
        path.join(root, "dist", "preactpress-theme.js"),
        "utf8",
      );
      expect(themeScript).toContain("classList.toggle('dark'");
      expect(notFound).toContain("404");
      await expect(fs.access(path.join(root, "dist", "favicon.svg"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "dist", "favicon.png"))).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, "dist", "preactpress-theme.js")),
      ).resolves.toBeUndefined();
      const assets = await fs.readdir(path.join(root, "dist", "assets"));
      const mainJs = assets.find((file) => file.startsWith("main-") && file.endsWith(".js"));
      expect(mainJs).toBeTruthy();
      const mainSize = (await fs.stat(path.join(root, "dist", "assets", mainJs!))).size;
      expect(mainSize).toBeLessThan(100_000);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("builds the docs template with tags and locales", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-build-docs-"));
    try {
      await init(root, { template: "docs" });
      await build(root);

      const index = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
      const markdown = await fs.readFile(
        path.join(root, "dist", "markdown-examples", "index.html"),
        "utf8",
      );
      const interactive = await fs.readFile(
        path.join(root, "dist", "interactive", "index.html"),
        "utf8",
      );
      const dynamicRoute = await fs.readFile(
        path.join(root, "dist", "packages", "preactpress", "index.html"),
        "utf8",
      );
      const contentLoaderPage = await fs.readFile(
        path.join(root, "dist", "examples", "content-loader", "index.html"),
        "utf8",
      );
      const notFound = await fs.readFile(path.join(root, "dist", "404.html"), "utf8");
      const tagIndex = await fs.readFile(
        path.join(root, "dist", "tags", "markdown", "index.html"),
        "utf8",
      );
      const deIndex = await fs.readFile(path.join(root, "dist", "de", "index.html"), "utf8");

      expect(index).toContain('<div id="app">');
      expect(index).toContain('<html lang="en">');
      expect(index).toContain('property="og:title"');
      expect(index).toContain('name="description"');
      expect(index).toMatch(/<meta name="description" content="[^"]+"/);
      expect(index).toContain('type="module"');
      expect(index).toContain('rel="stylesheet"');
      expect(index).toContain('href="/favicon.svg"');
      await expect(fs.access(path.join(root, "dist", "favicon.svg"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "dist", "favicon.png"))).resolves.toBeUndefined();
      expect(markdown).toContain("Markdown examples");
      expect(interactive).toContain("Interactive MDX");
      expect(interactive).toContain("<span>3</span>");
      expect(dynamicRoute).toContain("PreactPress");
      expect(dynamicRoute).toContain("Package slug: <code>preactpress</code>");
      expect(contentLoaderPage).toContain("Content loader example");
      expect(markdown).not.toContain('name="keywords"');
      expect(markdown).toContain('property="article:tag" content="markdown"');
      expect(markdown).toContain('type="application/ld+json"');
      expect(markdown).toContain('src="/preactpress-theme.js"');
      expect(markdown).toContain('class="pp-doc-tags"');
      expect(markdown).toContain('href="/tags/markdown"');
      expect(deIndex).toContain('<html lang="de">');
      expect(deIndex).toContain("Willkommen");
      expect(deIndex).toContain("Deutsch");
      expect(deIndex).toContain('aria-label="Menü schließen"');
      expect(notFound).toContain("404");
      expect(tagIndex).toContain("Pages tagged: markdown");
      expect(tagIndex).toContain("Markdown examples");
      await expect(fs.access(path.join(root, "dist", "README", "index.html"))).rejects.toThrow();
      await expect(
        fs.access(path.join(root, "dist", "partials", "shared-note", "index.html")),
      ).rejects.toThrow();
      await expect(
        fs.access(path.join(root, "dist", "parts", "include-body", "index.html")),
      ).rejects.toThrow();
      await expect(
        fs.access(path.join(root, "dist", "preactpress-search.json")),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, "dist", "preactpress-content", "markdown-examples.json")),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, "dist", "preactpress-content", "examples__content-loader.json")),
      ).resolves.toBeUndefined();
      const contentData = JSON.parse(
        await fs.readFile(
          path.join(root, "dist", "preactpress-content", "examples__content-loader.json"),
          "utf8",
        ),
      ) as { meta?: { contentData?: Array<{ route: string; title?: string }> } };
      expect(
        contentData.meta?.contentData?.some((entry) => entry.route === "/guide/getting-started"),
      ).toBe(true);
      await expect(
        fs.access(path.join(root, "dist", "preactpress-example.txt")),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, "dist", "preactpress-theme.js")),
      ).resolves.toBeUndefined();
      const search = JSON.parse(
        await fs.readFile(path.join(root, "dist", "preactpress-search.json"), "utf8"),
      ) as Array<{ route: string; locale?: string; title?: string; excerpt?: string }>;
      expect(search.find((entry) => entry.route === "/markdown-examples")).toMatchObject({
        locale: "root",
        title: "Markdown examples",
      });
      const assets = await fs.readdir(path.join(root, "dist", "assets"));
      const mainJs = assets.find((file) => file.startsWith("main-") && file.endsWith(".js"));
      expect(mainJs).toBeTruthy();
      const mainSize = (await fs.stat(path.join(root, "dist", "assets", mainJs!))).size;
      expect(mainSize).toBeLessThan(150_000);
      const mainBundle = await fs.readFile(path.join(root, "dist", "assets", mainJs!), "utf8");
      expect(mainBundle).not.toContain("Use blockquotes for callouts");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("builds the hono template with the custom theme and locales", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-build-hono-"));
    try {
      await init(root, { template: "hono" });
      await build(root);

      const index = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
      const guide = await fs.readFile(
        path.join(root, "dist", "guide", "getting-started", "index.html"),
        "utf8",
      );
      const deIndex = await fs.readFile(path.join(root, "dist", "de", "index.html"), "utf8");

      expect(index).toContain("Hono-inspired starter");
      expect(index).toContain('class="hn-site');
      expect(index).toContain("https://github.com/kamod-ch/preactpress");
      expect(guide).toContain("Getting Started");
      expect(guide).toContain('class="hn-sidebar"');
      expect(deIndex).toContain('<html lang="de">');
      expect(deIndex).toContain("Hono-inspirierter Starter");
      await expect(fs.access(path.join(root, "dist", "README", "index.html"))).rejects.toThrow();
      await expect(
        fs.access(path.join(root, "dist", "preactpress-search.json")),
      ).resolves.toBeUndefined();
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("builds the magazine template with content-loader teasers", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-build-magazine-"));
    try {
      await init(root, { template: "magazine" });
      await build(root);

      const index = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
      const article = await fs.readFile(
        path.join(root, "dist", "article-tech", "index.html"),
        "utf8",
      );

      expect(index).toContain('<html lang="de">');
      expect(index).toContain("Branchenjournal");
      expect(index).toContain("Automatisierung in der letzten Meile");
      expect(index).toContain('class="mag-shell');
      expect(index).toContain('href="/favicon.svg"');
      expect(article).toContain("API-Schnipsel");
      expect(article).toContain('class="mag-article');
      await expect(fs.access(path.join(root, "dist", "README", "index.html"))).rejects.toThrow();
      await expect(
        fs.access(path.join(root, "dist", "preactpress-search.json")),
      ).resolves.toBeUndefined();
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }, 15_000);

  it("builds the documentation-focused starters", async () => {
    const cases: Array<{
      template: "blog" | "product-docs" | "api-docs" | "saas-docs" | "knowledge-base";
      assert: (root: string) => Promise<void>;
    }> = [
      {
        template: "blog",
        assert: async (root) => {
          const index = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
          const feed = await fs.readFile(path.join(root, "dist", "feed.xml"), "utf8");
          expect(index).toContain("PreactPress Blog");
          expect(feed).toContain("Introducing PreactPress");
          await expect(
            fs.access(path.join(root, "dist", "preactpress-search.json")),
          ).resolves.toBeUndefined();
        },
      },
      {
        template: "product-docs",
        assert: async (root) => {
          const page = await fs.readFile(
            path.join(root, "dist", "getting-started", "index.html"),
            "utf8",
          );
          expect(page).toContain("Getting started");
          expect(page).toContain('class="pp-sidebar"');
        },
      },
      {
        template: "api-docs",
        assert: async (root) => {
          const page = await fs.readFile(
            path.join(root, "dist", "functions", "create-client", "index.html"),
            "utf8",
          );
          expect(page).toContain("createClient");
          expect(page).toContain("pp-api-signature");
        },
      },
      {
        template: "saas-docs",
        assert: async (root) => {
          const index = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
          const doc = await fs.readFile(
            path.join(root, "dist", "docs", "quickstart", "index.html"),
            "utf8",
          );
          expect(index).toContain("SaaS documentation starter");
          expect(doc).toContain("Quickstart");
        },
      },
      {
        template: "knowledge-base",
        assert: async (root) => {
          const index = await fs.readFile(path.join(root, "dist", "index.html"), "utf8");
          const search = JSON.parse(
            await fs.readFile(path.join(root, "dist", "preactpress-search.json"), "utf8"),
          ) as Array<{ route: string }>;
          expect(index).toContain("Acme Help Center");
          expect(search.some((entry) => entry.route === "/troubleshooting/login-issues")).toBe(
            true,
          );
        },
      },
    ];

    for (const { template, assert } of cases) {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), `preactpress-build-${template}-`));
      try {
        await init(root, { template });
        await build(root);
        await assert(root);
      } finally {
        await fs.rm(root, { recursive: true, force: true });
      }
    }
  }, 60_000);

  it("writes redirect outputs and excludes redirect routes from search", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-build-redirects-"));
    try {
      await fs.mkdir(path.join(root, ".preactpress"), { recursive: true });
      await fs.writeFile(
        path.join(root, ".preactpress", "config.ts"),
        `export default {
          site: {
            title: 'Redirect test',
            description: 'Redirect test site',
            url: 'https://example.com'
          },
          redirects: {
            '/old-guide': '/guide/new-guide'
          }
        }`,
        "utf8",
      );
      await fs.writeFile(
        path.join(root, "index.md"),
        `---
title: Home
description: Home page
---
# Home
`,
        "utf8",
      );
      await fs.mkdir(path.join(root, "guide"), { recursive: true });
      await fs.writeFile(
        path.join(root, "guide", "new-guide.md"),
        `---
title: New guide
description: Updated guide
---
# New guide
`,
        "utf8",
      );

      await build(root);

      const redirectHtml = await fs.readFile(
        path.join(root, "dist", "old-guide", "index.html"),
        "utf8",
      );
      const redirectsFile = await fs.readFile(path.join(root, "dist", "_redirects"), "utf8");
      const metadata = JSON.parse(
        await fs.readFile(path.join(root, "dist", "preactpress-redirects.json"), "utf8"),
      ) as {
        rules: Array<{ from: string; target: string }>;
        adapters: { netlify: { file: string } };
      };
      const search = JSON.parse(
        await fs.readFile(path.join(root, "dist", "preactpress-search.json"), "utf8"),
      ) as Array<{ route: string }>;

      expect(redirectHtml).toContain('rel="canonical" href="https://example.com/guide/new-guide/"');
      expect(redirectHtml).toContain('name="robots" content="noindex"');
      expect(redirectsFile).toBe("/old-guide  /guide/new-guide  301\n");
      expect(metadata.rules[0]).toMatchObject({
        from: "/old-guide",
        target: "/guide/new-guide",
      });
      expect(metadata.adapters.netlify.file).toBe("_redirects");
      expect(search.some((entry) => entry.route === "/old-guide")).toBe(false);
      expect(search.some((entry) => entry.route === "/guide/new-guide")).toBe(true);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }, 15_000);
});
