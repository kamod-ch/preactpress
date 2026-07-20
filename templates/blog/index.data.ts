import { createContentLoader } from "@kamod-ch/preactpress/config";
import { articleFromFrontmatter, type ArticlePost } from "@kamod-ch/preactpress/shared";

export default createContentLoader<ArticlePost[]>(["posts/*.md", "posts/*.mdx"], {
  transform(items) {
    const sorted = [...items].sort((a, b) => {
      const da = String(a.frontmatter.date ?? "");
      const db = String(b.frontmatter.date ?? "");
      return db.localeCompare(da);
    });
    return sorted.map((item) =>
      articleFromFrontmatter({
        route: item.route,
        url: item.url,
        title: item.title,
        description: item.description,
        tags: Array.isArray(item.frontmatter.tags)
          ? item.frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
          : undefined,
        frontmatter: item.frontmatter,
      }),
    );
  },
});
