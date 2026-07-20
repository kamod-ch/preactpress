import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "components/**"],
  site: {
    title: "Acme Help Center",
    description: "Find answers, troubleshoot issues, and contact support.",
    url: "https://help.example.com",
    lang: "en",
  },
  themeConfig: {
    outline: [2, 3],
    search: true,
    tags: true,
    footer: "© Acme — Help Center built with PreactPress.",
    nav: [
      { text: "Help", link: "/" },
      { text: "Getting started", link: "/getting-started/welcome" },
      { text: "Contact", link: "/contact" },
      { text: "Developer docs", link: "https://docs.example.com", target: "_blank" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Welcome", link: "/getting-started/welcome" },
          { text: "Create your account", link: "/getting-started/create-account" },
          { text: "Invite your team", link: "/getting-started/invite-team" },
        ],
      },
      {
        text: "Account & billing",
        items: [
          { text: "Manage subscription", link: "/account/manage-subscription" },
          { text: "Update payment method", link: "/account/payment-method" },
          { text: "Cancel account", link: "/account/cancel" },
        ],
      },
      {
        text: "Troubleshooting",
        items: [
          { text: "Login issues", link: "/troubleshooting/login-issues" },
          { text: "Sync not working", link: "/troubleshooting/sync-issues" },
          { text: "Email notifications", link: "/troubleshooting/email-notifications" },
        ],
      },
      {
        text: "Privacy & security",
        items: [
          { text: "Data retention", link: "/privacy/data-retention" },
          { text: "Two-factor authentication", link: "/privacy/two-factor" },
          { text: "Export your data", link: "/privacy/export-data" },
        ],
      },
    ],
  },
  build: { sitemap: true, robots: true },
});
