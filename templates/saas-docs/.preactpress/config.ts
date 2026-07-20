import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "components/**"],
  site: {
    title: "Acme Docs",
    description: "Documentation for Acme — the workspace platform for modern teams.",
    url: "https://docs.example.com",
    lang: "en",
  },
  theme: "./theme/Layout.tsx",
  markdown: {
    html: false,
    linkify: true,
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    footer:
      "Built with PreactPress · [Status](https://status.example.com) · [Support](mailto:support@example.com)",
    editLink: {
      pattern: "https://github.com/your-org/acme-docs/edit/main/:path",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kamod-ch/preactpress",
        ariaLabel: "GitHub",
      },
    ],
    nav: [
      { text: "Docs", link: "/docs/welcome" },
      { text: "API", link: "/docs/api" },
      { text: "Release notes", link: "/docs/release-notes" },
      { text: "Status", link: "https://status.example.com", target: "_blank" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Welcome", link: "/docs/welcome" },
          { text: "Quickstart", link: "/docs/quickstart" },
        ],
      },
      {
        text: "Workspace",
        items: [
          { text: "Account", link: "/docs/account" },
          { text: "Workspace", link: "/docs/workspace" },
          { text: "Team members", link: "/docs/team-members" },
          { text: "Roles & permissions", link: "/docs/roles-permissions" },
        ],
      },
      {
        text: "Billing & security",
        items: [
          { text: "Billing", link: "/docs/billing" },
          { text: "Security", link: "/docs/security" },
        ],
      },
      {
        text: "Developers",
        items: [
          { text: "Integrations", link: "/docs/integrations" },
          { text: "API", link: "/docs/api" },
          { text: "Webhooks", link: "/docs/webhooks" },
        ],
      },
      {
        text: "Support",
        items: [
          { text: "Troubleshooting", link: "/docs/troubleshooting" },
          { text: "Release notes", link: "/docs/release-notes" },
        ],
      },
    ],
  },
  build: { sitemap: true, robots: true },
});
