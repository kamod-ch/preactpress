import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "FRONTMATTER.md"],
  site: {
    title: "PreactPress Blog",
    description: "Technical writing about Preact, static sites, and documentation.",
    url: "https://blog.example.com",
    lang: "en",
  },
  theme: "./theme/Layout.tsx",
  markdown: {
    html: false,
    linkify: true,
    typographer: true,
  },
  themeConfig: {
    outline: [2, 3],
    search: true,
    tags: true,
    lastUpdated: true,
    footer: "Built with PreactPress.",
    editLink: {
      pattern: "https://github.com/your-org/your-blog/edit/main/:path",
      text: "Edit on GitHub",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kamod-ch/preactpress",
        ariaLabel: "PreactPress on GitHub",
      },
    ],
    nav: [
      { text: "Home", link: "/" },
      { text: "Articles", link: "/articles" },
      { text: "Authors", link: "/authors" },
      { text: "Tags", link: "/tags/preactpress" },
    ],
    sidebar: [
      {
        text: "Featured",
        items: [
          { text: "Introducing PreactPress", link: "/posts/introducing-preactpress" },
          { text: "Building documentation", link: "/posts/building-documentation" },
          { text: "Deploying PreactPress", link: "/posts/deploying-preactpress" },
          { text: "Custom themes", link: "/posts/custom-preactpress-theme" },
        ],
      },
    ],
  },
  build: {
    sitemap: true,
    robots: true,
    feed: { limit: 20 },
  },
  transformHead() {
    return [
      {
        tag: "link",
        attrs: {
          rel: "alternate",
          type: "application/atom+xml",
          title: "RSS Feed",
          href: "/feed.xml",
        },
      },
    ];
  },
});
