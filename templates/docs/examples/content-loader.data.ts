import { createContentLoader } from "@kamod-ch/preactpress/config";

export default createContentLoader(["guide/*.md"], {
  transform(items) {
    return items.map((item) => ({
      title: item.title,
      route: item.route,
      description: item.description,
    }));
  },
});
