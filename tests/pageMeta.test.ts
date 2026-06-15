import { describe, expect, it } from "vitest";
import { excerptFromHtml, resolvePageHeadMeta, resolvePageMeta } from "../src/shared/pageMeta.js";

describe("resolvePageMeta", () => {
  const site = { title: "Site", description: "Site summary" };

  it("uses page title and description when set", () => {
    expect(
      resolvePageMeta(
        { title: "Page", description: "Page lead", kind: "markdown", html: "<p>x</p>" },
        site,
      ),
    ).toEqual({
      title: "Page | Site",
      description: "Page lead",
    });
  });

  it("falls back to site description", () => {
    expect(resolvePageMeta({ title: "Page", kind: "markdown", html: "<p>x</p>" }, site)).toEqual({
      title: "Page | Site",
      description: "Site summary",
    });
  });

  it("builds excerpt from markdown html when descriptions are empty", () => {
    const html = "<p>" + "word ".repeat(40) + "</p>";
    const { description } = resolvePageMeta(
      { title: "Long", kind: "markdown", html },
      { title: "Site", description: "" },
    );
    expect(description.length).toBeGreaterThan(0);
    expect(description.length).toBeLessThanOrEqual(156);
    expect(description.endsWith("…")).toBe(true);
  });
});

describe("resolvePageHeadMeta", () => {
  const site = { title: "Site", description: "Site summary" };

  it("includes page tags for head meta generation", () => {
    expect(
      resolvePageHeadMeta(
        {
          title: "Page",
          description: "Page lead",
          tags: ["react", "docs"],
          kind: "markdown",
          html: "<p>x</p>",
        },
        site,
      ),
    ).toEqual({
      title: "Page | Site",
      description: "Page lead",
      tags: ["react", "docs"],
      image: undefined,
      pageType: "website",
    });
  });
});

describe("excerptFromHtml", () => {
  it("strips tags and collapses whitespace", () => {
    expect(excerptFromHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });
});
