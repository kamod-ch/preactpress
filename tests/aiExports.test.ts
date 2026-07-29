import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "../src/node/build.js";
import { init } from "../src/node/init.js";
import {
  collectAiPages,
  generateContextIndex,
  generateLlmsFullTxt,
  generateLlmsTxt,
  markdownOutPath,
  splitFullDocumentation,
} from "../src/node/aiExports.js";
import { resolveConfigForBuild } from "../src/node/config.js";
import type { PageView } from "../src/client/types.js";

function markdownPage(
  title: string,
  markdown: string,
  meta: Record<string, unknown> = {},
): PageView {
  return {
    kind: "markdown",
    title,
    description: `${title} description`,
    html: `<p>${title}</p>`,
    markdown,
    meta,
    headings: [],
  };
}

describe("aiExports", () => {
  it("maps routes to markdown output paths", () => {
    expect(markdownOutPath("/")).toBe("index.md");
    expect(markdownOutPath("/guide/start")).toBe("guide/start.md");
  });

  it("excludes drafts, tag indexes, and configured routes", () => {
    const pages = collectAiPages(
      [
        { route: "/", page: markdownPage("Home", "# Home") },
        { route: "/draft", page: markdownPage("Draft", "# Draft", { draft: true }) },
        { route: "/tags/demo", page: markdownPage("Tag", "# Tag", { tagIndex: true }) },
        { route: "/404", page: markdownPage("404", "# 404") },
        { route: "/private/hidden", page: markdownPage("Hidden", "# Hidden") },
      ],
      ["/404", "/private/**"],
    );
    expect(pages.map((entry) => entry.route)).toEqual(["/"]);
  });

  it("generates llms.txt with project metadata and markdown links", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-ai-config-"));
    try {
      await fs.mkdir(path.join(root, ".preactpress"), { recursive: true });
      await fs.writeFile(
        path.join(root, ".preactpress", "config.ts"),
        `export default {
          site: { title: 'Demo Docs', description: 'AI-ready docs', url: 'https://example.com' },
          ai: { llmsTxt: true, llmsFullTxt: true, copyMarkdown: true, contextIndex: true },
          themeConfig: {
            nav: [{ text: 'Guide', link: '/guide' }],
            sidebar: [{ text: 'Guide', items: [{ text: 'Start', link: '/guide' }] }],
          },
        }`,
        "utf8",
      );
      await fs.mkdir(path.join(root, "guide"), { recursive: true });
      await fs.writeFile(
        path.join(root, "guide", "index.md"),
        "---\ntitle: Getting started\n---\n\n# Getting started\n",
        "utf8",
      );
      const config = await resolveConfigForBuild(root);
      const entries = collectAiPages(
        [{ route: "/guide", page: markdownPage("Getting started", "# Getting started\n\nBody") }],
        config.ai === false ? [] : config.ai.exclude,
      );
      const llms = generateLlmsTxt(config, entries);
      expect(llms).toContain("# Demo Docs");
      expect(llms).toContain("> AI-ready docs");
      expect(llms).toContain("[Getting started](https://example.com/guide/");
      expect(llms).toContain("Markdown: https://example.com/guide.md/");
      expect(llms).toContain("[context.json](https://example.com/api/context.json/");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("generates consolidated llms-full documentation without HTML", () => {
    const config = {
      site: {
        title: "Demo",
        description: "Demo",
        base: "/",
        lang: "en",
        url: "https://example.com",
      },
      themeConfig: {},
      ai: {
        llmsTxt: true,
        llmsFullTxt: true,
        copyMarkdown: true,
        contextIndex: true,
        pageMarkdown: true,
        exclude: ["/404"],
        maxBundleBytes: 1_500_000,
        chunks: false,
      },
    } as Awaited<ReturnType<typeof resolveConfigForBuild>>;

    const full = generateLlmsFullTxt(config, [
      { route: "/guide", page: markdownPage("Guide", "## Install\n\n```bash\npnpm i\n```") },
    ]);
    expect(full).toContain("source: https://example.com/guide");
    expect(full).toContain("## Install");
    expect(full).toContain("```bash");
    expect(full).not.toContain("<p>");
  });

  it("splits oversized llms-full output into bundles", () => {
    const large = `${"x".repeat(900_000)}\n\n---\n\n${"y".repeat(900_000)}\n`;
    const { bundles, warning } = splitFullDocumentation(large, 1_000_000);
    expect(bundles).toHaveLength(2);
    expect(warning).toContain("split into 2 bundle(s)");
  });

  it("builds llms.txt, llms-full.txt, and context.json when ai is enabled", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-ai-build-"));
    try {
      await init(root);
      await fs.writeFile(
        path.join(root, ".preactpress", "config.ts"),
        `export default {
          site: {
            title: "AI Docs",
            description: "Documentation for AI tools",
            url: "https://example.com",
          },
          ai: {
            llmsTxt: true,
            llmsFullTxt: true,
            copyMarkdown: true,
            contextIndex: true,
          },
          themeConfig: {
            sidebar: [{ text: "Guide", items: [{ text: "About", link: "/about" }] }],
          },
        }`,
        "utf8",
      );
      await build(root);

      const llms = await fs.readFile(path.join(root, "dist", "llms.txt"), "utf8");
      const full = await fs.readFile(path.join(root, "dist", "llms-full.txt"), "utf8");
      const context = JSON.parse(
        await fs.readFile(path.join(root, "dist", "api", "context.json"), "utf8"),
      );
      const aboutMd = await fs.readFile(path.join(root, "dist", "about.md"), "utf8");

      expect(llms).toContain("# AI Docs");
      expect(llms).toContain("[context.json](https://example.com/api/context.json/");
      expect(full).toContain("source: https://example.com/about/");
      expect(aboutMd).toContain("# About us");
      expect(context.version).toBe(1);
      expect(context.project.name).toBe("AI Docs");
      expect(context.pages.some((page: { route: string }) => page.route === "/about")).toBe(true);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }, 30_000);

  it("produces a structured context index with pages and locales", () => {
    const config = {
      site: {
        title: "Demo",
        description: "Demo docs",
        base: "/",
        lang: "en",
        url: "https://example.com",
      },
      themeConfig: {},
      i18n: {
        defaultLocale: "en",
        locales: [{ key: "en", label: "English", lang: "en", link: "/" }],
      },
      versions: {
        enabled: false,
        versions: [],
        defaultVersionKey: "latest",
        currentDir: ".",
        labels: { switcher: "Version" },
      },
      ai: {
        llmsTxt: true,
        llmsFullTxt: true,
        copyMarkdown: true,
        contextIndex: true,
        pageMarkdown: true,
        exclude: ["/404"],
        maxBundleBytes: 1_500_000,
        chunks: false,
      },
    } as Awaited<ReturnType<typeof resolveConfigForBuild>>;

    const index = generateContextIndex(config, [
      { route: "/guide", page: markdownPage("Guide", "# Guide", { symbols: [{ name: "foo" }] }) },
    ]);
    expect(index).toMatchObject({
      version: 1,
      project: { name: "Demo", description: "Demo docs", url: "https://example.com" },
    });
    expect(index.pages[0]?.route).toBe("/guide");
    expect(index.symbols).toEqual([{ name: "foo", route: "/guide" }]);
    expect(index.locales).toHaveLength(1);
  });
});
