import { describe, expect, it } from "vitest";
import { socialIconSvg, socialLinkLabel } from "../src/shared/socialIcons.js";

describe("social links", () => {
  it("resolves built-in icon names", () => {
    expect(socialIconSvg("github")).toContain("<svg");
    expect(socialIconSvg("x")).toContain("<svg");
  });

  it("accepts custom SVG icons", () => {
    const svg = '<svg viewBox="0 0 1 1"></svg>';
    expect(socialIconSvg({ svg })).toBe(svg);
  });

  it("builds accessible labels", () => {
    expect(socialLinkLabel("github")).toBe("github");
    expect(socialLinkLabel({ svg: "<svg></svg>" }, "Project repo")).toBe("Project repo");
    expect(socialLinkLabel({ svg: "<svg></svg>" })).toBe("Social link");
  });
});
