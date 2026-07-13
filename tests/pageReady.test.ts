import { describe, expect, it } from "vitest";
import { injectDevPageDocument, pageHtml } from "../src/node/html.js";
import {
  injectPageReadyShell,
  renderStylesheetLink,
  resolvePageReadyConfig,
} from "../src/shared/pageReady.js";
import type { SiteConfig } from "../src/node/siteConfig.js";

const site = {
  site: { title: "Docs", description: "", base: "/", lang: "en", url: "https://example.com" },
  head: [],
  build: { sitemap: true, robots: true, feed: false },
  pageReady: resolvePageReadyConfig(undefined),
} as SiteConfig;

const siteWithoutPreloader = {
  ...site,
  pageReady: resolvePageReadyConfig(false),
} as SiteConfig;

describe("resolvePageReadyConfig", () => {
  it("enables defaults when omitted", () => {
    const config = resolvePageReadyConfig(undefined);
    expect(config).toMatchObject({
      fallbackMs: 5000,
      probe: "--pp-bg",
      stableFrames: 4,
      maxFrames: 300,
    });
    expect(config && config.preloader).toContain('id="pp-preloader"');
  });

  it("disables the shell when false", () => {
    expect(resolvePageReadyConfig(false)).toBe(false);
  });

  it("wraps inner preloader markup", () => {
    const config = resolvePageReadyConfig({ preloader: '<img src="/logo.svg" alt="" />' });
    expect(config).toMatchObject({ preloader: expect.stringContaining('id="pp-preloader"') });
    expect(config && config.preloader).toContain('<img src="/logo.svg" alt="" />');
  });

  it("passes through a full preloader element", () => {
    const custom =
      '<div id="pp-preloader" style="position:fixed;inset:0">Brand</div>';
    const config = resolvePageReadyConfig({ preloader: custom });
    expect(config && config.preloader).toBe(custom);
  });
});

describe("renderStylesheetLink", () => {
  it("renders blocking stylesheet links", () => {
    expect(renderStylesheetLink("/assets/main.css")).toBe(
      '<link rel="stylesheet" href="/assets/main.css">',
    );
    expect(renderStylesheetLink("/assets/main.css", { crossorigin: true })).toContain(
      "crossorigin",
    );
    expect(renderStylesheetLink("/assets/main.css")).not.toContain('media="print"');
  });
});

describe("injectPageReadyShell", () => {
  it("injects overlay and boot script once", () => {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head><title>Demo</title></head>
  <body>
    <div id="app">content</div>
    <script type="module" src="/assets/main.js"></script>
  </body>
</html>`;

    const out = injectPageReadyShell(html);

    expect(out).toContain('id="pp-page-ready"');
    expect(out).toContain('id="pp-preloader"');
    expect(out).toContain("themeCssApplied");
    expect(out).toContain("DOMContentLoaded");
    expect(out.indexOf('id="pp-preloader"')).toBeLessThan(out.indexOf('<div id="app">'));
    expect(out.indexOf("themeCssApplied")).toBeLessThan(out.indexOf("</body>"));
    expect(injectPageReadyShell(out)).toBe(out);
  });

  it("skips injection when disabled", () => {
    const html = `<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>`;
    expect(injectPageReadyShell(html, false)).toBe(html);
  });

  it("uses custom preloader markup", () => {
    const html = `<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>`;
    const out = injectPageReadyShell(html, {
      preloader: '<div id="pp-preloader">Custom</div>',
      fallbackMs: 2000,
      probe: false,
      stableFrames: 2,
      maxFrames: 120,
    });
    expect(out).toContain('<div id="pp-preloader">Custom</div>');
    expect(out).toContain("var FALLBACK_MS = 2000");
    expect(out).not.toContain("--pp-bg");
  });

  it("styles the default spinner for light and dark theme modes", () => {
    const html = `<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>`;
    const out = injectPageReadyShell(html);

    expect(out).toContain("--pp-preloader-bg");
    expect(out).toContain(":root[data-theme=\"dark\"]");
    expect(out).toContain("html.dark");
    expect(out).toContain("prefers-color-scheme: dark");
    expect(out).toContain('class="pp-preloader-spinner"');
  });

  it("keeps boot script at end of body when vite injects module scripts in head", () => {
    const html = `<!doctype html>
<html>
  <head>
    <script type="module" src="/@vite/client"></script>
    <title>Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/entry.ts"></script>
  </body>
</html>`;

    const out = injectPageReadyShell(html);
    const bootIndex = out.indexOf("themeCssApplied");
    const bodyEnd = out.indexOf("</body>");

    expect(out).toContain('class="pp-preloader-spinner"');
    expect(bootIndex).toBeGreaterThan(-1);
    expect(bootIndex).toBeLessThan(bodyEnd);
    expect(out.indexOf('src="/@vite/client"')).toBeLessThan(bootIndex);
  });
});

describe("pageHtml preloader", () => {
  it("includes the preloader shell and blocking css in production html", async () => {
    const html = await pageHtml({
      site,
      body: "<p>Hi</p>",
      title: "Home",
      description: "Intro",
      route: "/",
      mainJs: "assets/main.js",
      mainCss: ["assets/main.css"],
    });

    expect(html).toContain('id="pp-preloader"');
    expect(html).toContain('<link rel="stylesheet" href="/assets/main.css"');
    expect(html).not.toContain('media="print"');
  });

  it("omits the preloader shell when pageReady is false", async () => {
    const html = await pageHtml({
      site: siteWithoutPreloader,
      body: "<p>Hi</p>",
      title: "Home",
      description: "Intro",
      route: "/",
      mainJs: "assets/main.js",
      mainCss: ["assets/main.css"],
    });

    expect(html).not.toContain('id="pp-preloader"');
    expect(html).not.toContain('id="pp-page-ready"');
  });
});

describe("injectDevPageDocument preloader", () => {
  it("includes the preloader shell and blocking dev css", async () => {
    const out = await injectDevPageDocument(
      '<!doctype html><html><head><title>Old</title></head><body><div id="app"></div><script type="module" src="/@vite/client"></script></body></html>',
      {
        site,
        body: "<p>Hi</p>",
        title: "New",
        description: "Desc",
        route: "/",
        devStylesheets: ["/src/client/theme-default/styles.css"],
      },
    );

    expect(out).toContain('id="pp-preloader"');
    expect(out).toContain('<link rel="stylesheet" href="/src/client/theme-default/styles.css">');
    expect(out).not.toContain('media="print"');
    expect(out).toContain('<div id="app"><p>Hi</p></div>');
  });
});
