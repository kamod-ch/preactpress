import { describe, expect, it } from 'vitest'
import { collectHeadTags, injectDevPageDocument } from '../src/node/html.js'
import type { SiteConfig } from '../src/node/siteConfig.js'
import { resolveLocales } from '../src/shared/locale.js'

const site = {
  site: {
    title: 'Docs',
    description: '',
    base: '/',
    lang: 'en',
    url: 'https://example.com'
  },
  head: [],
  build: { sitemap: true, robots: true, feed: false }
} as SiteConfig

describe('html head rendering', () => {
  it('omits image meta tags when no image is configured', async () => {
    const head = await collectHeadTags({
      site,
      route: '/',
      title: 'Home',
      description: 'Intro'
    })

    expect(head).not.toContain('og:image')
    expect(head).not.toContain('twitter:image')
  })

  it('patches dev html through the parser', async () => {
    const out = await injectDevPageDocument(
      '<!doctype html><html><head><title>Old</title></head><body><div id="app"></div></body></html>',
      {
        site,
        body: '<p>Hi</p>',
        title: 'New',
        description: 'Desc',
        route: '/'
      }
    )

    expect(out).toContain('<html lang="en">')
    expect(out).toContain('<title>New</title>')
    expect(out).toContain('<div id="app"><p>Hi</p></div>')
  })

  it('renders locale-specific lang and alternate links', async () => {
    const i18n = resolveLocales(
      {
        root: { label: 'English', lang: 'en' },
        de: { label: 'Deutsch', lang: 'de' }
      },
      site.site,
      {}
    )
    const localizedSite = {
      ...site,
      i18n,
      routes: ['/', '/de']
    } as SiteConfig

    const out = await injectDevPageDocument(
      '<!doctype html><html><head><title>Old</title></head><body><div id="app"></div></body></html>',
      {
        site: localizedSite,
        body: '<p>Hallo</p>',
        title: 'Start',
        description: 'Intro',
        route: '/de'
      }
    )
    const head = await collectHeadTags({
      site: localizedSite,
      route: '/de',
      title: 'Start',
      description: 'Intro'
    })

    expect(out).toContain('<html lang="de">')
    expect(head).toContain('rel="alternate" hreflang="en"')
    expect(head).toContain('rel="alternate" hreflang="de"')
  })
})
