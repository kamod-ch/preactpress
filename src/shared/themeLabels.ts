import type { ThemeLabels } from '../node/siteConfig.js'

export interface ResolvedThemeLabels {
  skip: string
  navigation: string
  search: string
  filterPages: string
  searchResults: string
  previous: string
  next: string
  lastUpdated: string
  onThisPage: string
  language: string
}

const EN_LABELS: ResolvedThemeLabels = {
  skip: 'Skip to content',
  navigation: 'Navigation',
  search: 'Search',
  filterPages: 'Filter pages',
  searchResults: 'Search results',
  previous: 'Previous',
  next: 'Next',
  lastUpdated: 'Last updated',
  onThisPage: 'On this page',
  language: 'Language'
}

const DE_LABELS: ResolvedThemeLabels = {
  skip: 'Zum Inhalt springen',
  navigation: 'Navigation',
  search: 'Suche',
  filterPages: 'Seiten filtern',
  searchResults: 'Suchergebnisse',
  previous: 'Zurück',
  next: 'Weiter',
  lastUpdated: 'Zuletzt aktualisiert',
  onThisPage: 'Auf dieser Seite',
  language: 'Sprache'
}

export function defaultLabelsForLang(lang: string): ResolvedThemeLabels {
  return lang.toLowerCase().startsWith('de') ? DE_LABELS : EN_LABELS
}

export function resolveThemeLabels(
  lang: string,
  overrides: ThemeLabels | undefined
): ResolvedThemeLabels {
  const defaults = defaultLabelsForLang(lang)
  if (!overrides) return defaults
  return {
    skip: overrides.skip ?? defaults.skip,
    navigation: overrides.navigation ?? defaults.navigation,
    search: overrides.search ?? defaults.search,
    filterPages: overrides.filterPages ?? defaults.filterPages,
    searchResults: overrides.searchResults ?? defaults.searchResults,
    previous: overrides.previous ?? defaults.previous,
    next: overrides.next ?? defaults.next,
    lastUpdated: overrides.lastUpdated ?? defaults.lastUpdated,
    onThisPage: overrides.onThisPage ?? defaults.onThisPage,
    language: overrides.language ?? defaults.language
  }
}
