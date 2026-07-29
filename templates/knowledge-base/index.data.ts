import { loadCollection } from "@kamod-ch/preactpress/content";

export default loadCollection("articles", {
  sort: "order:asc",
  transform(entries) {
    return entries.map((entry) => ({
      title: entry.data.title,
      route: entry.route,
      description: entry.data.description,
      tags: entry.data.tags,
      popular: entry.data.popular,
    }));
  },
});
