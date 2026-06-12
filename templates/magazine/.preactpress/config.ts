import { defineConfig } from '@kamod-ch/preactpress/config'

export default defineConfig({
  site: {
    title: 'Branchenjournal',
    description: 'Static magazine-style starter for PreactPress',
    lang: 'de'
  },
  theme: './theme/Layout.tsx',
  markdown: {
    html: false,
    linkify: true,
    typographer: true
  },
  themeConfig: {
    outline: false,
    search: true,
    lastUpdated: true,
    footer:
      '© Demo — Layout nur als Vorlage. Inhalt fiktiv. Gebaut mit PreactPress.',
    nav: [
      { text: 'Start', link: '/' },
      { text: 'Märkte', link: '/article-markets' },
      { text: 'Tech', link: '/article-tech' }
    ],
    sidebar: [
      {
        text: 'In dieser Ausgabe',
        items: [
          { text: 'Handel und Margen', link: '/article-markets' },
          { text: 'Tech & Logistik', link: '/article-tech' }
        ]
      }
    ]
  }
})
