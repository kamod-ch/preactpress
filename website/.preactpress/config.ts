export default {
  site: {
    title: 'PreactPress',
    description:
      'Vite and Preact powered static site generator for Markdown and MDX content.',
    lang: 'en'
  },
  theme: './theme/Layout.tsx',
  markdown: {
    html: false,
    linkify: true,
    typographer: true
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    footer: 'Built with PreactPress.',
    githubUrl: 'https://github.com/your-org/preactpress',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'GitHub', link: 'https://github.com/your-org/preactpress' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
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
}
