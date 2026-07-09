import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { applySiteBaseOverride, normalizeBase, resolveConfig } from "../src/node/config.js";
import { PACKAGE_ROOT } from "../src/node/packageRoot.js";

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
});
