import { describe, expect, it } from "vitest";
import { applyTransformHtml, applyTransformPageData, invokeBuildEnd } from "../src/node/hooks.js";
import { resolveRegisteredPlugins } from "../src/node/pluginRuntime.js";
import type { SiteConfig } from "../src/node/siteConfig.js";
import type { PageView } from "../src/client/types.js";

const baseSite = {
  site: {
    title: "Docs",
    description: "Site description",
    base: "/",
    lang: "en",
  },
  head: [],
  build: { sitemap: true, robots: true, feed: false },
} as SiteConfig;

const markdownPage = (html: string): PageView => ({
  kind: "markdown",
  html,
  title: "Page",
  description: "Page description",
  meta: {},
  headings: [],
});

function siteWithHooks(hooks: Partial<SiteConfig>): SiteConfig {
  return {
    ...baseSite,
    ...hooks,
    plugins: resolveRegisteredPlugins(hooks as SiteConfig),
  };
}

describe("hooks", () => {
  it("applies transformPageData before render", async () => {
    const site = siteWithHooks({
      transformPageData(page) {
        if (page.kind !== "markdown") return page;
        return { ...page, title: "Transformed", html: "<p>Updated</p>" };
      },
    });

    const page = await applyTransformPageData(site, "/guide", markdownPage("<p>Original</p>"));
    expect(page.title).toBe("Transformed");
    expect(page.kind === "markdown" && page.html).toBe("<p>Updated</p>");
  });

  it("keeps the original page when transformPageData returns void", async () => {
    const site = siteWithHooks({
      transformPageData() {
        return undefined;
      },
    });

    const original = markdownPage("<p>Original</p>");
    const page = await applyTransformPageData(site, "/", original);
    expect(page).toBe(original);
  });

  it("applies transformHtml to the final document", async () => {
    const site = {
      ...baseSite,
      plugins: [],
      transformHtml(html: string, { route }: { route: string }) {
        return html.replace("</body>", `<!-- route:${route} --></body>`);
      },
    } as SiteConfig;

    const html = await applyTransformHtml(site, "<html><body></body></html>", "/about");
    expect(html).toContain("<!-- route:/about -->");
  });

  it("invokes buildEnd with rendered pages", async () => {
    const seen: Array<{ route: string; page: PageView }> = [];
    const site = siteWithHooks({
      buildEnd({ pages }) {
        seen.push(...pages);
      },
    });

    const pages = [{ route: "/", page: markdownPage("<p>Home</p>") }];
    await invokeBuildEnd(site, pages);
    expect(seen).toEqual(pages);
  });
});
