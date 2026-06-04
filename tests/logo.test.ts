import { describe, expect, it } from 'vitest'
import { resolveLogoHref } from '../src/client/theme-default/Logo.js'

describe('resolveLogoHref', () => {
  it('returns absolute URLs unchanged', () => {
    expect(resolveLogoHref('https://example.com/logo.png', '/')).toBe(
      'https://example.com/logo.png'
    )
  })

  it('prefixes site-relative paths with base', () => {
    expect(resolveLogoHref('/logo.svg', '/docs/')).toBe('/docs/logo.svg')
  })

  it('normalizes paths without a leading slash', () => {
    expect(resolveLogoHref('assets/logo.png', '/')).toBe('/assets/logo.png')
  })

  it('leaves root base unchanged', () => {
    expect(resolveLogoHref('/logo.svg', '/')).toBe('/logo.svg')
  })
})
