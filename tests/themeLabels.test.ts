import { describe, expect, it } from 'vitest'
import { defaultLabelsForLang, resolveThemeLabels } from '../src/shared/themeLabels.js'

describe('resolveThemeLabels', () => {
  it('returns English defaults', () => {
    expect(defaultLabelsForLang('en').search).toBe('Search')
  })

  it('returns German defaults', () => {
    expect(defaultLabelsForLang('de-DE').previous).toBe('Zurück')
  })

  it('merges themeConfig label overrides', () => {
    expect(
      resolveThemeLabels('en', {
        search: 'Find',
        onThisPage: 'Contents'
      })
    ).toEqual({
      ...defaultLabelsForLang('en'),
      search: 'Find',
      onThisPage: 'Contents'
    })
  })
})
