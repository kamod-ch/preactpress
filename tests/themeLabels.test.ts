import { describe, expect, it } from 'vitest'
import { defaultLabelsForLang, resolveThemeLabels } from '../src/shared/themeLabels.js'

describe('resolveThemeLabels', () => {
  it('returns English defaults', () => {
    expect(defaultLabelsForLang('en')).toMatchObject({
      search: 'Search',
      menu: 'Menu',
      closeMenu: 'Close menu'
    })
  })

  it('returns German defaults', () => {
    expect(defaultLabelsForLang('de-DE')).toMatchObject({
      previous: 'Zurück',
      menu: 'Menü',
      closeMenu: 'Menü schließen'
    })
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
