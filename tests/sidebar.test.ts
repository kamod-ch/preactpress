import { describe, expect, it } from 'vitest'
import {
  flattenNavLeafItems,
  flattenSidebarLeafItems,
  resolveSidebarForRoute
} from '../src/shared/sidebar.js'

describe('resolveSidebarForRoute', () => {
  const guide = [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/intro' }] }]
  const ref = [{ text: 'Ref', items: [{ text: 'API', link: '/reference/api' }] }]

  it('returns array sidebars unchanged', () => {
    expect(resolveSidebarForRoute(guide, '/guide/intro')).toEqual(guide)
  })

  it('flattens nested sidebar and nav items for pager and checks', () => {
    const nested = [
      {
        text: 'Guide',
        items: [
          { text: 'Intro', link: '/guide/intro' },
          {
            text: 'Advanced',
            items: [{ text: 'API', link: '/guide/api' }]
          }
        ]
      }
    ]
    expect(flattenSidebarLeafItems(nested)).toEqual([
      { text: 'Intro', link: '/guide/intro' },
      { text: 'API', link: '/guide/api' }
    ])
    expect(
      flattenNavLeafItems([
        { text: 'Docs', items: [{ text: 'Guide', link: '/guide' }] },
        { text: 'Blog', link: '/blog' }
      ])
    ).toEqual([
      { text: 'Guide', link: '/guide' },
      { text: 'Blog', link: '/blog' }
    ])
  })

  it('picks the longest matching path prefix', () => {
    const sidebar = {
      '/': [{ text: 'Root', items: [{ text: 'Home', link: '/' }] }],
      '/guide/': guide,
      '/reference/': ref
    }
    expect(resolveSidebarForRoute(sidebar, '/guide/intro')).toEqual(guide)
    expect(resolveSidebarForRoute(sidebar, '/reference/api')).toEqual(ref)
    expect(resolveSidebarForRoute(sidebar, '/about')).toEqual(sidebar['/'])
  })
})
