import { describe, expect, it } from "vitest";
import { selectSearchEntries, type SearchEntry } from "../../src/client/searchScore.js";

const routing: SearchEntry = { route: "/guide/routing", title: "Routing" };

describe("local title fallback", () => {
  it.each(["routng", "rouuting", "routinx", " ROUTNG "])("accepts one edit: %s", (query) => {
    expect(selectSearchEntries([routing], query)).toEqual([routing]);
  });

  it.each(["", "  ", "rotx", "routng api", "rotng", "rountig", "zzzzzz", "!!!"])(
    "rejects empty, short or distant queries: %s",
    (query) => expect(selectSearchEntries([routing], query)).toEqual([]),
  );

  it("requires long title words and never compares other fields fuzzily", () => {
    expect(selectSearchEntries([{ route: "/one", title: "Route" }], "rute")).toEqual([]);
    expect(selectSearchEntries([{ route: "/two", title: "Docs" }], "docxs")).toEqual([]);
    expect(
      selectSearchEntries([{ title: "Route", route: "/routing", excerpt: "Routing" }], "routng"),
    ).toEqual([]);
    expect(selectSearchEntries([{ title: "API", route: "/api" }], "apixx")).toEqual([]);
  });

  it("uses every query token and reuses lowercase normalization for English and German", () => {
    const entries = [routing, { route: "/de", title: "Änderungen Übersicht" }];
    expect(selectSearchEntries(entries, "ÜBERSICHT ÄNDERUNGN")).toEqual([entries[1]]);
    expect(
      selectSearchEntries([{ ...routing, title: "Routing Guides" }], "GUIDEX ROUTNG"),
    ).toHaveLength(1);
    expect(selectSearchEntries(entries, "routng missing")).toEqual([]);
    // No accent folding or transliteration is added.
    expect(selectSearchEntries([{ route: "/de", title: "Übermäßig" }], "uebermaessig")).toEqual([]);
  });

  it("keeps regular ranking and never appends fuzzy matches", () => {
    const exact = { route: "/exact", title: "routng" };
    const partial = { route: "/partial", excerpt: "routng" };
    expect(selectSearchEntries([partial, routing, exact], "routng")).toEqual([exact, partial]);
    expect(selectSearchEntries([routing], "rout")).toEqual([routing]);
  });

  it.each(["locale", "version", "workspace"] as const)(
    "filters %s before both search passes",
    (field) => {
      const inside = { ...routing, locale: "en", version: "v1", workspace: "docs" };
      const outside = { ...inside, [field]: "other", title: "routng" };
      expect(selectSearchEntries([outside, inside], "routng", "en", "v1", "docs")).toEqual([
        inside,
      ]);
      expect(
        selectSearchEntries([{ ...outside, title: "Routing" }], "routng", "en", "v1", "docs"),
      ).toEqual([]);
      expect(selectSearchEntries([outside], "routng", "en", "v1", "docs")).toEqual([]);
    },
  );

  it("limits both passes to eight, preserving index order on ties", () => {
    const entries = Array.from({ length: 12 }, (_, i) => ({ ...routing, route: `/page/${i}` }));
    for (const query of ["routing", "routng"]) {
      expect(selectSearchEntries(entries, query)).toEqual(entries.slice(0, 8));
      expect(selectSearchEntries(entries, query)).toEqual(entries.slice(0, 8));
    }
  });
});
