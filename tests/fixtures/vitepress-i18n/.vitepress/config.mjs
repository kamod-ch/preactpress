export default {
  title: "i18n VitePress",
  description: "VitePress i18n fixture",
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [{ text: "Guide", link: "/guide/" }],
        sidebar: [
          {
            text: "Guide",
            items: [{ text: "Welcome", link: "/guide/" }],
          },
        ],
      },
    },
    de: {
      label: "Deutsch",
      lang: "de",
      link: "/de/",
      themeConfig: {
        nav: [{ text: "Anleitung", link: "/de/guide/" }],
        sidebar: [
          {
            text: "Anleitung",
            items: [{ text: "Willkommen", link: "/de/guide/" }],
          },
        ],
      },
    },
  },
  sitemap: {
    hostname: "https://example.com",
  },
};
