import { describe, expect, it } from 'vitest'
import {
  algoliaOptionsFromSearch,
  getRelativeDocSearchUrl,
  isAlgoliaSearchEnabled,
  isLocalSearchEnabled,
  resolveAlgoliaOptions,
  resolveSearchProvider,
  validateAlgoliaCredentials
} from '../src/shared/search.js'

describe('search config', () => {
  it('resolves legacy boolean search', () => {
    expect(resolveSearchProvider(true)).toBe('local')
    expect(resolveSearchProvider(false)).toBe(false)
    expect(resolveSearchProvider(undefined)).toBe(false)
    expect(isLocalSearchEnabled(true)).toBe(true)
    expect(isAlgoliaSearchEnabled(true)).toBe(false)
  })

  it('resolves explicit providers', () => {
    const algolia = {
      provider: 'algolia' as const,
      options: { appId: 'a', apiKey: 'k', indexName: 'i' }
    }
    expect(resolveSearchProvider({ provider: 'local' })).toBe('local')
    expect(resolveSearchProvider(algolia)).toBe('algolia')
    expect(isAlgoliaSearchEnabled(algolia)).toBe(true)
    expect(algoliaOptionsFromSearch(algolia)).toEqual(algolia.options)
  })

  it('merges locale-specific Algolia overrides', () => {
    const options = resolveAlgoliaOptions(
      {
        appId: 'root',
        apiKey: 'root-key',
        indexName: 'root-index',
        placeholder: 'Search docs',
        locales: {
          de: { indexName: 'de-index', searchParameters: { facetFilters: ['lang:de'] } }
        }
      },
      'de'
    )
    expect(options).toMatchObject({
      appId: 'root',
      apiKey: 'root-key',
      indexName: 'de-index',
      placeholder: 'Search docs',
      searchParameters: { facetFilters: ['lang:de'] }
    })
  })

  it('validates Algolia credentials', () => {
    expect(validateAlgoliaCredentials({ appId: 'a', apiKey: 'k', indexName: 'i' }).valid).toBe(
      true
    )
    expect(validateAlgoliaCredentials({ appId: 'a', apiKey: 'k' }).valid).toBe(false)
  })

  it('normalizes DocSearch result URLs for clean URLs', () => {
    expect(getRelativeDocSearchUrl('https://example.com/docs/guide.html', '/docs/', true)).toBe(
      '/guide'
    )
    expect(
      getRelativeDocSearchUrl('https://example.com/docs/guide/index.html#intro', '/docs/', true)
    ).toBe('/guide/#intro')
  })
})
