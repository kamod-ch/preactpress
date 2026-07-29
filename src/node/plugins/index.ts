import type { PreactPressPlugin } from "../pluginTypes.js";

/** Minimal example plugin for documentation and tests. */
export function examplePlugin(): PreactPressPlugin {
  return {
    name: "preactpress:example",
    transformPageData(page, ctx) {
      if (page.kind !== "markdown") return page;
      if (!page.html.includes("data-example-plugin")) {
        return page;
      }
      return {
        ...page,
        meta: {
          ...page.meta,
          examplePlugin: true,
          route: ctx.route,
        },
      };
    },
    extendHead(page) {
      if (page.meta.examplePlugin) {
        return [["meta", { name: "preactpress-example-plugin", content: "true" }]];
      }
      return undefined;
    },
  };
}

export { aiExportsPlugin, llmsTxtPlugin } from "./llmsTxt.js";
export { redirectsPlugin } from "./redirects.js";
