import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "partials/**", "parts/**"],
  site: {
    title: "My PreactPress Site",
    description: "A simple static site built with PreactPress",
  },
  markdown: {
    html: false,
  },
  themeConfig: {
    outline: true,
    search: true,
    footer: "Built with PreactPress.",
    nav: [
      { text: "Home", link: "/" },
      { text: "About", link: "/about" },
    ],
    sidebar: [
      {
        text: "Start",
        items: [
          { text: "Home", link: "/" },
          { text: "About", link: "/about" },
          { text: "Your first 5 minutes", link: "/guide/first-five-minutes" },
        ],
      },
    ],
  },
});
