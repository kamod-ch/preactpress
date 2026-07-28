import { defineConfig } from "@kamod-ch/preactpress/config";
import { mermaidPlugin } from "@preactpress/plugin-mermaid";
import { playgroundPlugin } from "@preactpress/plugin-playground";

export default defineConfig({
  srcExclude: ["README.md"],
  plugins: [mermaidPlugin(), playgroundPlugin()],
  site: {
    title: "PreactPress Showcase",
    description: "Feature showcase for PreactPress documentation framework",
    url: "https://example.com",
  },
  redirects: {
    "/legacy": "/guide/features",
  },
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
  },
  themeConfig: {
    search: true,
    nav: [
      { text: "Guide", link: "/guide/features" },
      { text: "Playground", link: "/guide/playground" },
    ],
    sidebar: [
      {
        text: "Showcase",
        items: [
          { text: "Overview", link: "/" },
          { text: "Features", link: "/guide/features" },
          { text: "Diagrams", link: "/guide/diagrams" },
          { text: "Playground", link: "/guide/playground" },
        ],
      },
    ],
  },
});
