import { describe, expect, it } from "vitest";
import { formatTitleTemplate, resolvePageHeadMeta } from "../src/shared/pageMeta.js";

describe("formatTitleTemplate", () => {
  it("replaces :title and :siteTitle", () => {
    expect(
      formatTitleTemplate(":title · :siteTitle", { title: "Routing", siteTitle: "Docs" }),
    ).toBe("Routing · Docs");
  });

  it("returns site title when page title is missing", () => {
    expect(formatTitleTemplate(":title | :siteTitle", { siteTitle: "Docs" })).toBe("Docs");
  });

  it("honors false to use raw page title", () => {
    expect(formatTitleTemplate(false, { title: "Routing", siteTitle: "Docs" })).toBe("Routing");
  });
});

describe("resolvePageHeadMeta titleTemplate", () => {
  const site = { title: "Site", description: "Summary", titleTemplate: ":title — :siteTitle" };

  it("uses site titleTemplate by default", () => {
    expect(resolvePageHeadMeta({ title: "Page" }, site).title).toBe("Page — Site");
  });

  it("allows per-page override", () => {
    expect(resolvePageHeadMeta({ title: "Page", titleTemplate: ":title" }, site).title).toBe(
      "Page",
    );
  });
});
