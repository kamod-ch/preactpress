import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "components/**"],
  site: {
    title: "Acme Client API",
    description: "JavaScript/TypeScript API reference for the Acme client SDK.",
    url: "https://example.com",
    lang: "en",
  },
  themeConfig: {
    outline: [2, 3],
    search: true,
    lastUpdated: true,
    footer: "Built with PreactPress.",
    editLink: {
      pattern: "https://github.com/your-org/your-repo/edit/main/:path",
    },
    nav: [
      { text: "Overview", link: "/overview" },
      { text: "Functions", link: "/functions/create-client" },
      { text: "Examples", link: "/examples/basic-usage" },
    ],
    sidebar: {
      "/functions/": [
        {
          text: "Client",
          items: [
            { text: "createClient", link: "/functions/create-client" },
            { text: "Client.ping", link: "/functions/client-ping" },
          ],
        },
        {
          text: "Resources",
          items: [
            { text: "users.list", link: "/functions/users-list" },
            { text: "users.create", link: "/functions/users-create" },
          ],
        },
      ],
      "/": [
        {
          text: "Getting started",
          items: [
            { text: "Overview", link: "/" },
            { text: "API overview", link: "/overview" },
            { text: "Installation", link: "/installation" },
            { text: "Authentication", link: "/authentication" },
            { text: "Configuration", link: "/configuration" },
          ],
        },
        {
          text: "Reference",
          items: [
            { text: "Functions", link: "/functions/create-client" },
            { text: "Components", link: "/reference/components/provider" },
            { text: "Hooks", link: "/reference/hooks/use-acme-client" },
            { text: "Types", link: "/types/client-options" },
          ],
        },
        {
          text: "Guides",
          items: [
            { text: "Error handling", link: "/error-handling" },
            { text: "Examples", link: "/examples/basic-usage" },
          ],
        },
      ],
    },
  },
  build: { sitemap: true, robots: true },
});
