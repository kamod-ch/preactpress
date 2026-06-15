import { describe, expect, it } from "vitest";
import type { ModuleNode } from "vite";
import { collectCssUrlsFromModule, isCssModuleId } from "../src/node/devCss.js";
import { injectDevPageDocument, renderStylesheetLinks } from "../src/node/html.js";
import type { SiteConfig } from "../src/node/siteConfig.js";

function mod(id: string, url: string, imported: ModuleNode[] = []): ModuleNode {
  return { id, url, importedModules: new Set(imported) } as ModuleNode;
}

describe("devCss", () => {
  it("detects css module ids", () => {
    expect(isCssModuleId("/src/theme/styles.css")).toBe(true);
    expect(isCssModuleId("/src/theme/styles.css?direct")).toBe(true);
    expect(isCssModuleId("/src/app.tsx")).toBe(false);
  });

  it("collects css urls from the client module graph", () => {
    const css = mod("/pkg/styles.css", "/src/client/theme-default/styles.css");
    const layout = mod("/pkg/Layout.tsx", "/src/client/theme-default/Layout.tsx", [css]);
    const app = mod("/pkg/app.tsx", "/src/client/app.tsx", [layout]);
    const entry = mod("/pkg/entry-client.tsx", "/src/client/entry-client.tsx", [app]);

    expect(collectCssUrlsFromModule(entry)).toEqual(["/src/client/theme-default/styles.css"]);
  });
});

describe("injectDevPageDocument dev stylesheets", () => {
  const site = {
    site: { title: "T", description: "D", base: "/", lang: "en" },
    head: [],
    srcDir: ".",
    root: ".",
    configDir: ".",
    theme: "",
    themeConfig: {},
    outDir: "dist",
    cacheDir: ".vite",
    markdown: {},
    build: {},
    logger: console,
  } as unknown as SiteConfig;

  it("injects dev stylesheet links before first paint", async () => {
    const input =
      '<!doctype html><html><head><title>Old</title></head><body><div id="app"></div></body></html>';

    const out = await injectDevPageDocument(input, {
      site,
      body: "<p>Hi</p>",
      title: "New",
      description: "Desc",
      route: "/",
      devStylesheets: ["/src/client/theme-default/styles.css"],
    });

    expect(out).toContain(renderStylesheetLinks(["/src/client/theme-default/styles.css"]));
    expect(out).toContain('<motion id="app"><p>Hi</p></motion>'.replaceAll("motion", "div"));
    expect(out).toContain("<title>New</title>");
  });
});
