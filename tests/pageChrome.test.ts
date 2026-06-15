import { describe, expect, it } from "vitest";
import { filterHeadingsForOutline, resolvePageChrome } from "../src/shared/pageChrome.js";

describe("page chrome", () => {
  it("resolves default doc chrome from empty frontmatter", () => {
    expect(
      resolvePageChrome(undefined, { outline: true, footer: "Footer", lastUpdated: true }),
    ).toMatchObject({
      layout: "doc",
      isHome: false,
      showNavbar: true,
      showSidebar: true,
      showAside: true,
      outlineLevels: [2, 3],
      showPager: true,
      showFooter: true,
      showLastUpdated: true,
      markdownStyles: true,
    });
  });

  it("resolves home chrome and VitePress-style hero/features", () => {
    const chrome = resolvePageChrome({
      layout: "home",
      hero: {
        name: "PreactPress",
        text: "Markdown to sites",
        actions: [
          { text: "Start", link: "/guide/", theme: "brand" },
          { text: "GitHub", link: "https://example.com", theme: "alt" },
        ],
      },
      features: [{ icon: "A", title: "Fast", details: "Built on Vite", link: "/guide/" }],
    });

    expect(chrome).toMatchObject({
      layout: "home",
      isHome: true,
      showSidebar: false,
      showAside: false,
      showPager: false,
      markdownStyles: true,
    });
    expect(chrome.hero?.actions).toEqual([
      { text: "Start", link: "/guide/", theme: "brand", target: undefined, rel: undefined },
      {
        text: "GitHub",
        link: "https://example.com",
        theme: "alt",
        target: undefined,
        rel: undefined,
      },
    ]);
    expect(chrome.features).toEqual([
      {
        icon: "A",
        title: "Fast",
        details: "Built on Vite",
        link: "/guide/",
        linkText: undefined,
        rel: undefined,
        target: undefined,
      },
    ]);
  });

  it("allows page-level chrome overrides", () => {
    expect(
      resolvePageChrome(
        {
          layout: "home",
          navbar: false,
          sidebar: true,
          aside: "left",
          outline: [2, 4],
          footer: false,
          editLink: false,
          lastUpdated: false,
          pageClass: "landing",
          markdownStyles: false,
        },
        { footer: "Footer", editLink: {}, lastUpdated: true },
      ),
    ).toMatchObject({
      layout: "home",
      showNavbar: false,
      showSidebar: true,
      aside: "left",
      showAside: true,
      outlineLevels: [2, 4],
      showFooter: false,
      showEditLink: false,
      showLastUpdated: false,
      pageClass: "landing",
      markdownStyles: false,
    });
  });

  it("keeps page layout content unstyled", () => {
    expect(resolvePageChrome({ layout: "page", markdownStyles: true })).toMatchObject({
      layout: "page",
      showSidebar: false,
      showAside: false,
      showPager: false,
      markdownStyles: false,
    });
  });

  it("filters outline headings by configured levels", () => {
    const headings = [
      { id: "a", text: "A", level: 1 },
      { id: "b", text: "B", level: 2 },
      { id: "c", text: "C", level: 3 },
      { id: "d", text: "D", level: 4 },
    ];

    expect(filterHeadingsForOutline(headings, [2, 3]).map((heading) => heading.id)).toEqual([
      "b",
      "c",
    ]);
    expect(filterHeadingsForOutline(headings, false)).toEqual([]);
  });
});
