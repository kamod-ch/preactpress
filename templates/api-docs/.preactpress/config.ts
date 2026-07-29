import { defineConfig } from "@kamod-ch/preactpress/config";
import { openapiPlugin } from "@preactpress/plugin-openapi";

export default defineConfig({
  srcExclude: ["README.md", "components/**", "openapi/**", "resources/.openapi-manifest.json"],
  site: {
    title: "Protocol",
    description: "REST API and TypeScript SDK documentation for the Acme messaging platform.",
    url: "https://example.com",
    lang: "en",
  },
  theme: "./theme/Layout.tsx",
  plugins: [
    openapiPlugin({
      input: "./openapi/acme.yaml",
      route: "/resources",
    }),
  ],
  themeConfig: {
    outline: [2, 3],
    search: true,
    lastUpdated: true,
    footer: "Built with PreactPress.",
    signInLink: {
      text: "Sign in",
      link: "https://app.example.com",
    },
    editLink: {
      pattern: "https://github.com/your-org/your-repo/edit/main/:path",
    },
    nav: [
      { text: "API", link: "/resources" },
      { text: "Documentation", link: "/" },
      { text: "Support", link: "/support" },
    ],
    sidebar: {
      "/resources/": [
        {
          text: "Resources",
          items: [{ text: "Overview", link: "/resources" }],
        },
      ],
      "/functions/": [
        {
          text: "SDK Reference",
          items: [
            { text: "createClient", link: "/functions/create-client" },
            { text: "Client.ping", link: "/functions/client-ping" },
            { text: "users.list", link: "/functions/users-list" },
            { text: "users.create", link: "/functions/users-create" },
          ],
        },
      ],
      "/types/": [
        {
          text: "Types",
          items: [{ text: "ClientOptions", link: "/types/client-options" }],
        },
      ],
      "/reference/": [
        {
          text: "Components & hooks",
          items: [
            { text: "Provider", link: "/reference/components/provider" },
            { text: "useAcmeClient", link: "/reference/hooks/use-acme-client" },
          ],
        },
      ],
      "/": [
        {
          text: "Guides",
          items: [
            { text: "Introduction", link: "/" },
            { text: "Quickstart", link: "/quickstart" },
            { text: "SDKs", link: "/sdks" },
            { text: "Authentication", link: "/authentication" },
            { text: "Pagination", link: "/pagination" },
            { text: "Errors", link: "/errors" },
            { text: "Webhooks", link: "/webhooks" },
          ],
        },
        {
          text: "Resources",
          items: [
            { text: "Contacts", link: "/resources/tags/contacts" },
            { text: "Conversations", link: "/resources/tags/conversations" },
            { text: "Messages", link: "/resources/tags/messages" },
            { text: "Groups", link: "/resources/tags/groups" },
            { text: "Attachments", link: "/resources/tags/attachments" },
          ],
        },
        {
          text: "SDK",
          items: [
            { text: "Installation", link: "/installation" },
            { text: "Basic usage", link: "/examples/basic-usage" },
            { text: "createClient", link: "/functions/create-client" },
            { text: "Types", link: "/types/client-options" },
            { text: "Provider", link: "/reference/components/provider" },
            { text: "useAcmeClient", link: "/reference/hooks/use-acme-client" },
            { text: "REST example", link: "/examples/rest-endpoint" },
          ],
        },
      ],
    },
  },
  build: { sitemap: true, robots: true },
});
