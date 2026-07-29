import { loadCollection } from "@kamod-ch/preactpress/content";
import { articleFromFrontmatter, type ArticlePost } from "@kamod-ch/preactpress/shared";

export default loadCollection("articles", {
  transform(entries) {
    return entries.map((entry) =>
      articleFromFrontmatter({
        route: entry.route,
        url: entry.url,
        title: entry.data.title,
        description: entry.data.description,
        tags: entry.data.tags,
        frontmatter: entry.data as Record<string, unknown>,
      }),
    ) satisfies ArticlePost[];
  },
});
