export default {
  site: {
    title: 'PreactPress',
    description: 'Vite + Preact static site'
  },
  markdown: {
    html: false
  },
  themeConfig: {
    outline: true,
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Markdown', link: '/markdown-examples' },
      { text: 'MDX', link: '/interactive' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Markdown examples', link: '/markdown-examples' },
          { text: 'Interactive MDX', link: '/interactive' }
        ]
      }
    ]
  }
}
