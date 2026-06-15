import { describe, expect, it } from "vitest";
import { shouldIgnoreDeadLink } from "../src/shared/deadLinks.js";

describe("shouldIgnoreDeadLink", () => {
  it("ignores all links when true", () => {
    expect(shouldIgnoreDeadLink("/missing", true, { from: "index.md" })).toBe(true);
  });

  it("matches glob patterns against href and route", () => {
    const ignore = ["/wip/*", "/draft/**"];
    expect(
      shouldIgnoreDeadLink("/wip/page", ignore, { from: "index.md", route: "/wip/page" }),
    ).toBe(true);
    expect(
      shouldIgnoreDeadLink("/draft/a/b", ignore, { from: "index.md", route: "/draft/a/b" }),
    ).toBe(true);
    expect(shouldIgnoreDeadLink("/missing", ignore, { from: "index.md", route: "/missing" })).toBe(
      false,
    );
  });

  it("supports custom filter functions", () => {
    const ignore = (href: string) => href.startsWith("/external-docs");
    expect(shouldIgnoreDeadLink("/external-docs/foo", ignore, { from: "index.md" })).toBe(true);
    expect(shouldIgnoreDeadLink("/other", ignore, { from: "index.md" })).toBe(false);
  });
});
