import { describe, expect, it } from "vitest";
import { articleFromFrontmatter, parseAuthor, parseCategory } from "../src/shared/contentSchema.js";

describe("contentSchema", () => {
  it("parses string and object authors", () => {
    expect(parseAuthor("Redaktion")).toEqual({ name: "Redaktion" });
    expect(parseAuthor({ name: "Alex", slug: "alex" })).toEqual({ name: "Alex", slug: "alex" });
  });

  it("parses string and object categories", () => {
    expect(parseCategory("Märkte")).toEqual({ name: "Märkte" });
    expect(parseCategory({ name: "Tech", slug: "tech" })).toEqual({ name: "Tech", slug: "tech" });
  });

  it("maps frontmatter to article posts", () => {
    expect(
      articleFromFrontmatter({
        route: "/article-markets",
        url: "/article-markets",
        title: "Handel",
        description: "Kurztext",
        tags: ["Handel"],
        frontmatter: {
          author: "Redaktion",
          category: "Märkte",
          readTime: "6 Min.",
        },
      }),
    ).toEqual({
      title: "Handel",
      route: "/article-markets",
      url: "/article-markets",
      description: "Kurztext",
      tags: ["Handel"],
      author: { name: "Redaktion" },
      category: { name: "Märkte" },
      readTime: "6 Min.",
    });
  });
});
