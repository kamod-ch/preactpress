import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "Kamod Monorepo Docs",
    description: "Unified documentation for UI, Icons, and Hooks packages",
    url: "https://example.com",
  },
  workspaces: {
    autoDiscover: true,
    versionMode: "package",
    labels: {
      switcher: "Package",
    },
    items: [
      {
        name: "UI",
        id: "ui",
        root: "packages/ui",
        docs: "./docs",
        repository: "https://github.com/example/kamod/tree/main/packages/ui",
      },
      {
        name: "Icons",
        id: "icons",
        root: "packages/icons",
        docs: "./docs",
        repository: "https://github.com/example/kamod/tree/main/packages/icons",
      },
      {
        name: "Hooks",
        id: "hooks",
        root: "packages/hooks",
        docs: "./docs",
        repository: "https://github.com/example/kamod/tree/main/packages/hooks",
      },
    ],
  },
  themeConfig: {
    nav: [
      { text: "Overview", link: "/" },
      { text: "UI", link: "/ui" },
      { text: "Icons", link: "/icons" },
      { text: "Hooks", link: "/hooks" },
    ],
    search: true,
    sidebar: {
      "/ui/": [
        {
          text: "UI",
          items: [
            { text: "Introduction", link: "/ui" },
            { text: "Getting started", link: "/ui/getting-started" },
            { text: "Changelog", link: "/ui/changelog" },
          ],
        },
      ],
      "/icons/": [
        {
          text: "Icons",
          items: [
            { text: "Introduction", link: "/icons" },
            { text: "Usage", link: "/icons/usage" },
          ],
        },
      ],
      "/hooks/": [
        {
          text: "Hooks",
          items: [
            { text: "Introduction", link: "/hooks" },
            { text: "useCounter", link: "/hooks/use-counter" },
          ],
        },
      ],
    },
  },
});
