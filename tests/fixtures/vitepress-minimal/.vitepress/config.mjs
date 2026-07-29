export default {
  title: "Minimal VitePress",
  description: "A minimal VitePress fixture for migration tests",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "GitHub", link: "https://github.com/example/minimal" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/guide/" },
          { text: "Getting Started", link: "/guide/getting-started" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/example/minimal" }],
    footer: "MIT Licensed",
  },
  sitemap: {
    hostname: "https://example.com",
  },
};
