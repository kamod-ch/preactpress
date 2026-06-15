import { describe, expect, it } from "vitest";
import type { ContentFile } from "../src/node/content.js";
import { applyRouteRewrites } from "../src/shared/rewrites.js";

function file(route: string): ContentFile {
  return { route, file: `/site${route}.md`, kind: "markdown" };
}

describe("applyRouteRewrites", () => {
  it("aliases a public route to existing content", () => {
    const map = new Map<string, ContentFile>([
      ["/", file("/")],
      ["/guide", file("/guide")],
    ]);
    applyRouteRewrites(map, { "/docs": "/guide" });
    expect(map.get("/docs")).toEqual({ ...file("/guide"), route: "/docs" });
    expect(map.get("/guide")).toEqual(file("/guide"));
  });

  it("throws when the source route is missing", () => {
    const map = new Map<string, ContentFile>([["/", file("/")]]);
    expect(() => applyRouteRewrites(map, { "/docs": "/missing" })).toThrow(
      /rewrite source route not found/,
    );
  });

  it("throws on rewrite collisions", () => {
    const map = new Map<string, ContentFile>([
      ["/guide", file("/guide")],
      ["/about", file("/about")],
    ]);
    expect(() => applyRouteRewrites(map, { "/about": "/guide" })).toThrow(/rewrite collision/);
  });
});
