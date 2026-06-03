export default {
  site: {
    title: 'PreactPress',
    description: 'Vite + Preact static site generator — starter docs'
  },
  markdown: {
    html: false
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    footer: 'Built with PreactPress.'
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/what-is-preactpress' },
          { text: 'About', link: '/about' }
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'Welcome', link: '/' },
              { text: 'What is PreactPress?', link: '/guide/what-is-preactpress' },
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'Routing', link: '/guide/routing' },
              { text: 'Deploy', link: '/guide/deploy' },
              { text: 'Your first 5 minutes', link: '/guide/first-five-minutes' }
            ]
          },
          {
            text: 'Reference',
            items: [
              { text: 'Markdown examples', link: '/markdown-examples' },
              { text: 'Interactive MDX', link: '/interactive' }
            ]
          }
        ]
      }
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      link: '/de/',
      title: 'PreactPress',
      description: 'Vite + Preact Static-Site-Generator — Starter-Dokumentation',
      themeConfig: {
        footer: 'Erstellt mit PreactPress.',
        nav: [
          { text: 'Start', link: '/de' },
          { text: 'Anleitung', link: '/de/guide/what-is-preactpress' },
          { text: 'Über uns', link: '/de/about' }
        ],
        sidebar: [
          {
            text: 'Einführung',
            items: [
              { text: 'Willkommen', link: '/de' },
              { text: 'Was ist PreactPress?', link: '/de/guide/what-is-preactpress' },
              { text: 'Getting Started', link: '/de/guide/getting-started' },
              { text: 'Routing', link: '/de/guide/routing' },
              { text: 'Deploy', link: '/de/guide/deploy' },
              { text: 'Die ersten 5 Minuten', link: '/de/guide/first-five-minutes' }
            ]
          },
          {
            text: 'Referenz',
            items: [
              { text: 'Markdown-Beispiele', link: '/de/markdown-examples' },
              { text: 'Interaktives MDX', link: '/de/interactive' }
            ]
          }
        ]
      }
    }
  }
}
