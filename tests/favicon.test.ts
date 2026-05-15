import { describe, expect, it } from 'vitest'
import { defaultFaviconHead, faviconRequestPaths, hasFaviconHead } from '../src/node/favicon.js'

describe('favicon', () => {
  it('detects custom icon head tags', () => {
    expect(hasFaviconHead([])).toBe(false)
    expect(hasFaviconHead([['link', { rel: 'icon', href: '/custom.ico' }]])).toBe(true)
    expect(hasFaviconHead([['link', { rel: 'apple-touch-icon', href: '/a.png' }]])).toBe(true)
    expect(hasFaviconHead([['link', { rel: 'canonical', href: '/' }]])).toBe(false)
  })

  it('builds base-aware default favicon links', () => {
    expect(defaultFaviconHead('/')).toEqual([
      ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      ['link', { rel: 'icon', href: '/favicon-32.png', type: 'image/png', sizes: '32x32' }],
      ['link', { rel: 'icon', href: '/favicon.png', type: 'image/png', sizes: 'any' }],
      ['link', { rel: 'apple-touch-icon', href: '/favicon.png' }]
    ])
    expect(defaultFaviconHead('/docs')[0]).toEqual([
      'link',
      { rel: 'icon', href: '/docs/favicon.svg', type: 'image/svg+xml' }
    ])
  })

  it('lists dev middleware paths for each favicon file', () => {
    expect(faviconRequestPaths('/docs')).toEqual(
      new Set(['/docs/favicon.svg', '/docs/favicon.png', '/docs/favicon-32.png'])
    )
  })
})
