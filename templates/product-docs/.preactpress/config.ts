import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "components/**"],
  site: {
    title: "Acme SDK",
    description: "Documentation for the Acme SDK — build faster with PreactPress.",
    url: "https://example.com",
    lang: "en",
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    tags: true,
    footer: "Built with PreactPress.",
    editLink: {
      pattern: "https://github.com/your-org/your-repo/edit/main/:path",
      text: "Edit this page on GitHub",
    },
    nav: [
      { text: "Docs", link: "/getting-started" },
      { text: "Changelog", link: "/changelog" },
      { text: "v2.0", link: "/getting-started" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Overview", link: "/" },
          { text: "Getting started", link: "/getting-started" },
          { text: "Installation", link: "/installation" },
          { text: "Configuration", link: "/configuration" },
        ],
      },
      {
        text: "Core concepts",
        items: [
          { text: "Architecture", link: "/concepts/architecture" },
          { text: "Data model", link: "/concepts/data-model" },
          { text: "Lifecycle", link: "/concepts/lifecycle" },
        ],
      },
      {
        text: "Features",
        items: [
          { text: "Authentication", link: "/features/authentication" },
          { text: "Webhooks", link: "/features/webhooks" },
          { text: "Batch operations", link: "/features/batch-operations" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "First integration", link: "/guides/first-integration" },
          { text: "Error handling", link: "/guides/error-handling" },
          { text: "Performance", link: "/guides/performance" },
        ],
      },
      {
        text: "Integrations",
        items: [
          { text: "Node.js", link: "/integrations/nodejs" },
          { text: "Cloudflare Workers", link: "/integrations/cloudflare" },
        ],
      },
      {
        text: "Operations",
        items: [
          { text: "Deployment", link: "/deployment" },
          { text: "Migration from v1", link: "/migration" },
          { text: "Troubleshooting", link: "/troubleshooting" },
          { text: "FAQ", link: "/faq" },
          { text: "Changelog", link: "/changelog" },
        ],
      },
    ],
  },
  build: {
    sitemap: true,
    robots: true,
  },
});
