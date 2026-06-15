import { describe, expect, it } from "vitest";
import type { SiteData, ThemeConfig } from "../src/node/siteConfig.js";
import {
  localizeRoute,
  localeFromRoute,
  localizedRouteForLocale,
  resolveLocales,
  routePathKey,
  siteForRoute,
  stripLocalePrefix,
} from "../src/shared/locale.js";
import { tagIndexPageRoute } from "../src/shared/tags.js";

const site: SiteData = {
  title: "Docs",
  description: "English docs",
  base: "/",
  lang: "en",
};

const themeConfig: ThemeConfig = {
  search: true,
  nav: [{ text: "Home", link: "/" }],
};

describe("locale helpers", () => {
  it("resolves root and prefixed locales", () => {
    const i18n = resolveLocales(
      {
        root: { label: "English", lang: "en" },
        de: {
          label: "Deutsch",
          lang: "de",
          title: "Doku",
          description: "Deutsche Doku",
          themeConfig: { nav: [{ text: "Start", link: "/de" }] },
        },
      },
      site,
      themeConfig,
    );

    expect(i18n?.defaultLocaleKey).toBe("root");
    expect(i18n?.locales.map((locale) => [locale.key, locale.prefix, locale.link])).toEqual([
      ["root", "", "/"],
      ["de", "/de", "/de/"],
    ]);
    expect(i18n?.locales[1].site).toMatchObject({
      title: "Doku",
      description: "Deutsche Doku",
      lang: "de",
    });
    expect(i18n?.locales[1].themeConfig).toMatchObject({
      search: true,
      nav: [{ text: "Start", link: "/de" }],
    });
  });

  it("maps routes to path keys and localized routes", () => {
    const i18n = resolveLocales(
      {
        root: { label: "English", lang: "en" },
        de: { label: "Deutsch", lang: "de" },
      },
      site,
      themeConfig,
    )!;
    const de = i18n.locales.find((locale) => locale.key === "de")!;

    expect(localeFromRoute("/de/about", i18n)?.key).toBe("de");
    expect(stripLocalePrefix("/de/about", de)).toBe("/about");
    expect(routePathKey("/de/about", i18n)).toBe("/about");
    expect(localizeRoute("/about", de)).toBe("/de/about");
    expect(localizeRoute("/", de)).toBe("/de");
    expect(localizedRouteForLocale("/about", de, i18n, new Set(["/de"]))).toBe("/de");
  });

  it("builds locale-prefixed tag routes", () => {
    expect(tagIndexPageRoute("markdown")).toBe("/tags/markdown");
    expect(tagIndexPageRoute("markdown", "/de")).toBe("/de/tags/markdown");
  });

  it("keeps the canonical site base when a locale site was resolved earlier", () => {
    const i18n = resolveLocales(
      {
        root: { label: "English", lang: "en" },
        de: { label: "Deutsch", lang: "de" },
      },
      site,
      themeConfig,
    )!;
    const deployedSite = { ...site, base: "/preactpress" };

    expect(siteForRoute(deployedSite, "/", i18n).base).toBe("/preactpress");
    expect(siteForRoute(deployedSite, "/de", i18n).base).toBe("/preactpress");
  });
});
