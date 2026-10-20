import { describe, expect, it } from "vitest";
import { scoreSearchEntry } from "../../src/client/searchScore.js";
import type { SearchEntry } from "../../src/client/useSiteSearch.js";

const entry: SearchEntry = {
  route: "/guide/routing",
  title: "Routing",
  description: "Configure routes and redirects",
  tags: ["routing", "config"],
  excerpt: "Learn about file-based routing",
};

describe("scoreSearchEntry", () => {
  it("ranks exact title matches highest", () => {
    expect(scoreSearchEntry(entry, "routing")).toBeGreaterThan(scoreSearchEntry(entry, "redirect"));
  });

  it("returns zero when nothing matches", () => {
    expect(scoreSearchEntry(entry, "zzznomatch")).toBe(0);
  });
});
