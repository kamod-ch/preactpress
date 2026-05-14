export default {
  site: {
    title: 'PreactPress',
    description: 'Vite + Preact static site'
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Markdown', link: '/markdown-examples' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Markdown examples', link: '/markdown-examples' }
        ]
      }
    ]
  }
}
