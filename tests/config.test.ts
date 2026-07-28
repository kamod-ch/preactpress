import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createLogger } from "vite";
import { afterEach, describe, expect, it } from "vitest";
import { applySiteBaseOverride, normalizeBase, resolveConfig, resolveSiteConfig } from "../src/node/config.js";
import { ConfigError } from "../src/node/configError.js";
import {
  DEFAULT_BUILD,
  DEFAULT_CHECK,
  DEFAULT_MARKDOWN,
  DEFAULT_SITE,
} from "../src/node/configDefaults.js";
import { PACKAGE_ROOT } from "../src/node/packageRoot.js";
import { validateUserConfig } from "../src/node/validateUserConfig.js";

const tempRoots: string[] = [];

async function makeSite(config: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-config-"));
  tempRoots.push(root);
  await fs.mkdir(path.join(root, ".preactpress"), { recursive: true });
  await fs.writeFile(path.join(root, ".preactpress", "config.ts"), config, "utf8");
  return root;
}

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("config", () => {
  it("normalizes site bases", () => {
    expect(normalizeBase("docs/")).toBe("/docs");
    expect(normalizeBase("/docs/")).toBe("/docs");
    expect(normalizeBase("/")).toBe("/");
  });

  it("resolves defaults and markdown options", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', base: 'docs/' },
      markdown: { html: true }
    }`);

    const config = await resolveConfig(root);
    expect(config.site).toMatchObject({ title: "Docs", base: "/docs" });
    expect(config.markdown).toEqual({
      html: true,
      linkify: true,
      typographer: true,
      emoji: false,
      math: false,
    });
  });

  it("loads themeConfig.logo", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' },
      themeConfig: { logo: '/brand.svg', nav: [{ text: 'Home', link: '/' }] }
    }`);
    const config = await resolveConfig(root);
    expect(config.themeConfig.logo).toBe("/brand.svg");
  });

  it("loads async config factories", async () => {
    const root = await makeSite(`export default async () => ({
      site: { title: 'Async Docs', description: 'Loaded at runtime' },
      themeConfig: {
        nav: [{ text: 'Home', link: '/' }],
        sidebar: [{ text: 'Guide', items: [{ text: 'Intro', link: '/intro' }] }]
      }
    })`);

    const config = await resolveConfig(root);
    expect(config.site.title).toBe("Async Docs");
    expect(config.themeConfig.sidebar).toEqual([
      { text: "Guide", items: [{ text: "Intro", link: "/intro" }] },
    ]);
  });

  it("loads defineConfig async factories", async () => {
    const defineConfigImport = pathToFileURL(
      path.join(PACKAGE_ROOT, "dist/node/config-helpers.js"),
    ).href;
    const root = await makeSite(`import { defineConfig } from '${defineConfigImport}'

export default defineConfig(async () => ({
  site: { title: 'Factory Docs', description: 'From defineConfig' },
  themeConfig: { nav: [{ text: 'Home', link: '/' }] }
}))`);

    const config = await resolveConfig(root);
    expect(config.site.title).toBe("Factory Docs");
    expect(config.themeConfig.nav).toEqual([{ text: "Home", link: "/" }]);
  });

  it("resolves locale-specific site and theme config", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'English docs' },
      themeConfig: { search: true, nav: [{ text: 'Home', link: '/' }] },
      locales: {
        root: { label: 'English', lang: 'en' },
        de: {
          label: 'Deutsch',
          lang: 'de',
          title: 'Doku',
          description: 'Deutsche Doku',
          themeConfig: { nav: [{ text: 'Start', link: '/de' }] }
        }
      }
    }`);

    const config = await resolveConfig(root);
    expect(config.i18n?.locales.map((locale) => [locale.key, locale.prefix, locale.link])).toEqual([
      ["root", "", "/"],
      ["de", "/de", "/de/"],
    ]);
    expect(config.i18n?.locales[1].site).toMatchObject({
      title: "Doku",
      description: "Deutsche Doku",
      lang: "de",
    });
    expect(config.i18n?.locales[1].themeConfig).toMatchObject({
      search: true,
      nav: [{ text: "Start", link: "/de" }],
    });
  });

  it("resolves favicon convenience config", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', base: 'docs/' },
      favicon: { svg: '/brand/favicon.svg', png32: '/brand/favicon-32.png', apple: 'https://cdn.example/apple.png' }
    }`);

    const config = await resolveConfig(root);
    expect(config.head).toEqual([
      ["link", { rel: "icon", href: "/docs/brand/favicon.svg", type: "image/svg+xml" }],
      [
        "link",
        {
          rel: "icon",
          href: "/docs/brand/favicon-32.png",
          type: "image/png",
          sizes: "32x32",
        },
      ],
      ["link", { rel: "apple-touch-icon", href: "https://cdn.example/apple.png" }],
    ]);
  });

  it("lets explicit head favicons override default and convenience favicons", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', base: 'docs/' },
      favicon: '/brand/favicon.svg',
      head: [['link', { rel: 'icon', href: '/custom.ico' }]]
    }`);

    const config = await resolveConfig(root);
    expect(config.head).toEqual([["link", { rel: "icon", href: "/custom.ico" }]]);
  });

  it("resolves pageReady defaults and custom options", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' },
      pageReady: {
        preloader: '<div id="pp-preloader">Loading</div>',
        fallbackMs: 1200,
        probe: false
      }
    }`);
    const config = await resolveConfig(root);
    expect(config.pageReady).toMatchObject({
      preloader: '<div id="pp-preloader">Loading</div>',
      fallbackMs: 1200,
      probe: false,
      stableFrames: 4,
      maxFrames: 300,
    });
  });

  it("disables pageReady when false", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' },
      pageReady: false
    }`);
    const config = await resolveConfig(root);
    expect(config.pageReady).toBe(false);
  });

  it("applies CLI base overrides to locales and default favicon head tags", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'English docs' },
      locales: {
        root: { label: 'English', lang: 'en' },
        de: { label: 'Deutsch', lang: 'de' }
      }
    }`);

    const config = await resolveConfig(root);
    applySiteBaseOverride(config, "/preactpress/");

    expect(config.site.base).toBe("/preactpress");
    expect(config.i18n?.locales.every((locale) => locale.site.base === "/preactpress")).toBe(true);
    expect(config.head.find((tag) => tag[1].href === "/preactpress/favicon.svg")).toBeTruthy();
  });

  it("resolves extension defaults when omitted", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' }
    }`);

    const config = await resolveConfig(root);
    expect(config.versions.enabled).toBe(false);
    expect(config.versions.versions).toEqual([]);
    expect(config.plugins).toEqual([]);
    expect(config.apiDocs).toBe(false);
    expect(config.openapi).toBe(false);
    expect(config.ai).toBe(false);
    expect(config.redirects.rules).toEqual([]);
    expect(config.redirects.generateHtmlFallbacks).toBe(true);
    expect(config.redirects.generateRedirectsFile).toBe(true);
    expect(config.check).toEqual(DEFAULT_CHECK);
  });

  it("resolves extension options from user config", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' },
      versions: {
        latest: { label: 'Next' },
        '2.0': { label: 'v2.0', link: '/2.0/' }
      },
      plugins: [{ name: 'demo', enforce: 'pre' }],
      apiDocs: { tsconfig: 'tsconfig.docs.json' },
      openapi: { spec: 'openapi.yaml', base: 'api/' },
      ai: { llmsTxt: true },
      redirects: {
        "/old": "/new",
      },
      check: { failOnWarnings: true }
    }`);

    const config = await resolveConfig(root);
    expect(config.versions.defaultVersionKey).toBe("latest");
    expect(config.versions.versions.filter((entry) => !entry.isAlias)).toHaveLength(2);
    expect(config.plugins.map((plugin) => ({ name: plugin.name, enforce: plugin.enforce }))).toEqual([
      { name: "demo", enforce: "pre" },
      { name: "preactpress:ai-exports", enforce: "post" },
    ]);
    expect(config.apiDocs).toMatchObject({
      enabled: true,
      tsconfig: "tsconfig.docs.json",
      outDir: "api",
    });
    expect(config.openapi).toMatchObject({
      enabled: true,
      spec: "openapi.yaml",
      base: "/api",
    });
    expect(config.ai).toEqual({
      llmsTxt: true,
      llmsFullTxt: true,
      copyMarkdown: true,
      contextIndex: true,
      pageMarkdown: true,
      exclude: ["/404", "/tags/**"],
      maxBundleBytes: 1_500_000,
      chunks: false,
    });
    expect(config.redirects.rules).toEqual([
      {
        from: "/old",
        to: "/new",
        status: 301,
        target: "/new",
        external: false,
      },
    ]);
    expect(config.check).toEqual({ failOnWarnings: true, plugins: true });
  });

  it("throws ConfigError for unknown top-level options", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' },
      unknownOption: true
    }`);

    await expect(resolveConfig(root)).rejects.toThrow(
      'preactpress config: unknownOption: unknown option "unknownOption"',
    );
  });

  it("throws ConfigError for invalid plugin entries", async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' },
      plugins: [{ enforce: 'pre' }]
    }`);

    await expect(resolveConfig(root)).rejects.toThrow(
      "preactpress config: plugins[0].name: expected a non-empty string",
    );
  });

  it("throws ConfigError for duplicate redirect sources", () => {
    expect(() =>
      validateUserConfig({
        site: { title: "Docs", description: "Docs", base: "/", lang: "en" },
        redirects: [
          { from: "/old", to: "/a" },
          { from: "/old/", to: "/b" },
        ],
      }),
    ).toThrow('duplicate redirect source "/old"');
  });

  it("resolveSiteConfig applies central defaults", () => {
    const root = path.join(PACKAGE_ROOT, "templates/default");
    const config = resolveSiteConfig(
      {},
      {
        root,
        configDir: path.join(root, ".preactpress"),
        logger: createLogger("error"),
      },
    );

    expect(config.site).toMatchObject(DEFAULT_SITE);
    expect(config.markdown).toEqual(DEFAULT_MARKDOWN);
    expect(config.build).toEqual(DEFAULT_BUILD);
    expect(config.check).toEqual(DEFAULT_CHECK);
    expect(config.apiDocs).toBe(false);
  });

  it("rejects invalid markdown booleans before theme resolution", () => {
    expect(() =>
      validateUserConfig({
        markdown: { html: "yes" as unknown as boolean },
      }),
    ).toThrow("preactpress config: markdown.html: expected a boolean");
  });

  it("surfaces ConfigError name for tooling", () => {
    try {
      validateUserConfig({ plugins: [{ name: "" }] });
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect((error as ConfigError).path).toBe("plugins[0].name");
    }
  });
});
