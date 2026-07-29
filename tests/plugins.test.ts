import { describe, expect, it } from "vitest";
import { PluginError } from "../src/node/pluginTypes.js";
import { applyPluginsConfig, normalizePlugins, sortPlugins } from "../src/node/pluginRuntime.js";
import {
  createTestPluginContext,
  createTestResolvedConfig,
  runExtendRoutes,
  runTransformMarkdown,
  runTransformPageData,
} from "../src/node/pluginTestkit.js";
import { examplePlugin, llmsTxtPlugin, redirectsPlugin } from "../src/node/plugins/index.js";
import type { PreactPressPlugin } from "../src/node/pluginTypes.js";
import type { PageView } from "../src/client/types.js";

describe("plugins", () => {
  it("sorts plugins by enforce pre, default, post", () => {
    const sorted = sortPlugins([
      { name: "z-post", enforce: "post" },
      { name: "m-default" },
      { name: "a-pre", enforce: "pre" },
      { name: "b-pre", enforce: "pre" },
    ]);
    expect(sorted.map((plugin) => plugin.name)).toEqual(["a-pre", "b-pre", "m-default", "z-post"]);
  });

  it("rejects duplicate plugin names", () => {
    expect(() => normalizePlugins([{ name: "dup" }, { name: "dup" }])).toThrow(PluginError);
  });

  it("wraps hook failures with the plugin name", async () => {
    const plugin: PreactPressPlugin = {
      name: "broken",
      transformMarkdown() {
        throw new Error("boom");
      },
    };
    await expect(
      runTransformMarkdown([plugin], "# Title", { route: "/", file: "/index.md" }),
    ).rejects.toThrow('preactpress plugin "broken": transformMarkdown failed: boom');
  });

  it("runs config hooks in deterministic order", async () => {
    const calls: string[] = [];
    const plugins = normalizePlugins([
      {
        name: "second",
        config(config) {
          calls.push("second");
          return { ...config, site: { ...config.site!, title: "Second" } };
        },
      },
      {
        name: "first",
        enforce: "pre",
        config(config) {
          calls.push("first");
          return { ...config, site: { ...config.site!, title: "First" } };
        },
      },
    ]);
    const result = await applyPluginsConfig(
      { site: { title: "Original", description: "x" } },
      plugins,
    );
    expect(calls).toEqual(["first", "second"]);
    expect(result.site?.title).toBe("Second");
  });

  it("applies transformMarkdown hooks sequentially without mutating the original source", async () => {
    const source = "```MERMAID\ngraph TD\n```";
    const plugin: PreactPressPlugin = {
      name: "normalize-mermaid",
      transformMarkdown(markdown) {
        return markdown.replace(/^([ \t]*```)[ \t]*mermaid[ \t]*$/gim, "$1mermaid");
      },
    };
    const next = await runTransformMarkdown([plugin], source, {
      route: "/docs",
      file: "/docs/page.md",
    });
    expect(next).toContain("```mermaid");
    expect(source).toContain("```MERMAID");
  });

  it("extends routes through plugins", async () => {
    const routes = await runExtendRoutes(
      [
        {
          name: "virtual-route",
          extendRoutes(existing) {
            return [...existing, { route: "/virtual", file: "virtual.md", kind: "markdown" }];
          },
        },
      ],
      [{ route: "/", file: "index.md", kind: "markdown" }],
    );
    expect(routes.map((route) => route.route)).toEqual(["/", "/virtual"]);
  });

  it("runs example plugin transformations", async () => {
    const page: PageView = {
      kind: "markdown",
      html: '<p data-example-plugin="true">Hello</p>',
      title: "Example",
      description: "Example page",
      meta: {},
      headings: [],
    };
    const transformed = await runTransformPageData([examplePlugin()], page, "/example");
    expect(transformed.meta.examplePlugin).toBe(true);
    expect(transformed.meta.route).toBe("/example");
  });

  it("exposes plugin context with root and outDir", () => {
    const ctx = createTestPluginContext({
      root: "/project",
      outDir: "/project/dist",
    });
    expect(ctx.root).toBe("/project");
    expect(ctx.outDir).toBe("/project/dist");
    expect(ctx.config.outDir).toBe("/project/dist");
  });

  it("registers built-in redirects and ai export plugins", () => {
    expect(redirectsPlugin().name).toBe("preactpress:redirects");
    expect(llmsTxtPlugin().name).toBe("preactpress:ai-exports");
    expect(
      createTestResolvedConfig({ plugins: [redirectsPlugin(), llmsTxtPlugin()] }).plugins,
    ).toHaveLength(2);
  });

  it("runs transformFence hooks until one returns HTML", async () => {
    const { runTransformFence } = await import("../src/node/pluginTestkit.js");
    const html = await runTransformFence(
      [
        {
          name: "skip",
          transformFence() {
            return undefined;
          },
        },
        {
          name: "render",
          transformFence(lang, code) {
            if (lang === "diagram") return `<div>${code}</div>`;
          },
        },
      ],
      "diagram",
      "content",
      "",
      { route: "/", file: "/index.md" },
    );
    expect(html).toBe("<div>content</div>");
  });
});
