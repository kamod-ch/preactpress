export default {
  srcExclude: ['README.md', 'partials/**', 'parts/**'],
  site: {
    title: 'PreactPress',
    description: 'Vite + Preact static site generator for Markdown and MDX'
  },
  markdown: {
    html: false,
    emoji: true,
    math: true
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
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Reference', link: '/guide/configuration' },
          { text: 'Examples', link: '/markdown-examples' }
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'Overview', link: '/' },
              { text: 'What is PreactPress?', link: '/guide/what-is-preactpress' },
              { text: 'Getting started', link: '/guide/getting-started' },
              { text: 'First five minutes', link: '/guide/first-five-minutes' }
            ]
          },
          {
            text: 'Authoring',
            items: [
              { text: 'Creating pages', link: '/guide/creating-pages' },
              { text: 'Markdown and MDX', link: '/guide/markdown-and-mdx' },
              { text: 'Routing and i18n', link: '/guide/routing' },
              { text: 'Default theme', link: '/guide/default-theme' }
            ]
          },
          {
            text: 'Reference',
            items: [
              { text: 'Configuration', link: '/guide/configuration' },
              { text: 'CLI and validation', link: '/guide/commands' },
              { text: 'Advanced APIs', link: '/guide/advanced' },
              { text: 'Custom themes', link: '/guide/custom-themes' },
              { text: 'Deploy', link: '/guide/deploy' }
            ]
          },
          {
            text: 'Examples',
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
      description: 'Kleine deutschsprachige i18n-Demo für PreactPress',
      themeConfig: {
        footer: 'Erstellt mit PreactPress.',
        nav: [
          { text: 'Start', link: '/de' },
          { text: 'Einführung', link: '/de/guide/what-is-preactpress' },
          { text: 'English docs', link: '/guide/getting-started' }
        ],
        sidebar: [
          {
            text: 'i18n-Demo',
            items: [
              { text: 'Willkommen', link: '/de' },
              { text: 'Was ist PreactPress?', link: '/de/guide/what-is-preactpress' },
              { text: 'Erste Schritte', link: '/de/guide/getting-started' }
            ]
          }
        ]
      }
    }
  }
}
