import { defineConfig } from 'preactpress/config'

export default defineConfig({
  srcExclude: ['README.md', 'partials/**', 'parts/**'],
  site: {
    title: 'Hono Starter',
    description: 'Fast, lightweight docs and landing pages built on Web Standards.'
  },
  theme: './theme/Layout.tsx',
  markdown: {
    html: false
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    footer: 'Built with PreactPress.',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/your-org/your-project',
        ariaLabel: 'GitHub'
      }
    ]
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/guide/what-is-preactpress' },
          { text: 'Examples', link: '/markdown-examples' },
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
              { text: 'Your first 5 minutes', link: '/guide/first-five-minutes' },
              { text: 'Creating pages', link: '/guide/creating-pages' },
              { text: 'Commands', link: '/guide/commands' },
              { text: 'Configuration', link: '/guide/configuration' }
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
      title: 'Hono Starter',
      description: 'Schnelle, schlanke Docs und Landing Pages auf Web-Standards.',
      themeConfig: {
        footer: 'Erstellt mit PreactPress.',
        nav: [
          { text: 'Docs', link: '/de/guide/what-is-preactpress' },
          { text: 'Beispiele', link: '/de/markdown-examples' },
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
              { text: 'Die ersten 5 Minuten', link: '/de/guide/first-five-minutes' },
              { text: 'Seiten erstellen', link: '/de/guide/seiten-erstellen' },
              { text: 'Befehle', link: '/de/guide/commands' },
              { text: 'Konfiguration', link: '/de/guide/configuration' }
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
})
