import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "Versioned Docs",
    description: "PreactPress documentation versioning example",
    url: "https://example.com",
  },
  locales: {
    root: { label: "English", lang: "en" },
    de: { label: "Deutsch", lang: "de" },
  },
  versions: {
    current: "2.0",
    aliases: {
      latest: "2.0",
    },
    labels: {
      switcher: "Version",
      archivedBanner:
        "You are viewing docs for {label}. See the {currentLabel} docs for the latest version.",
    },
    items: [
      {
        value: "2.0",
        label: "2.x",
        status: "current",
      },
      {
        value: "1.0",
        label: "1.x",
        status: "archived",
      },
    ],
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/overview" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Getting started", link: "/guide/getting-started" },
            { text: "Configuration", link: "/guide/configuration" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API",
          items: [{ text: "Overview", link: "/api/overview" }],
        },
      ],
    },
  },
});
