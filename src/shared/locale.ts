import type {
  LocaleConfig,
  ResolvedI18n,
  ResolvedLocale,
  SiteData,
  ThemeConfig
} from '../node/siteConfig.js'
import { normalizeRoute } from './route.js'

export function resolveLocales(
  userLocales: Record<string, LocaleConfig> | undefined,
  site: SiteData,
  themeConfig: ThemeConfig
): ResolvedI18n | undefined {
  const entries = Object.entries(userLocales ?? {})
  if (entries.length === 0) return undefined

  const defaultLocaleKey = userLocales?.root ? 'root' : entries[0][0]
  const locales = entries.map(([key, locale]) => {
    const prefix = localePrefixForKey(key)
    const link = locale.link ?? `${prefix || ''}/`
    const lang = locale.lang ?? (key === 'root' ? site.lang : key)
    const localeSite = {
      ...site,
      title: locale.title ?? site.title,
      description: locale.description ?? site.description,
      lang
    }

    return {
      key,
      label: locale.label,
      lang,
      link,
      prefix,
      site: localeSite,
      themeConfig: {
        ...themeConfig,
        ...(locale.themeConfig ?? {})
      }
    }
  })

  return { defaultLocaleKey, locales }
}

export function localePrefixForKey(key: string): string {
  return key === 'root' ? '' : normalizeRoute(`/${key}`)
}

export function localeFromRoute(
  route: string,
  i18n: ResolvedI18n | undefined
): ResolvedLocale | undefined {
  if (!i18n) return undefined
  const normalized = normalizeRoute(route)
  const prefixed = [...i18n.locales]
    .filter((locale) => locale.prefix)
    .sort((a, b) => b.prefix.length - a.prefix.length)
  const match = prefixed.find(
    (locale) => normalized === locale.prefix || normalized.startsWith(`${locale.prefix}/`)
  )
  if (match) return match
  return i18n.locales.find((locale) => locale.key === i18n.defaultLocaleKey) ?? i18n.locales[0]
}

export function stripLocalePrefix(route: string, locale: ResolvedLocale | undefined): string {
  const normalized = normalizeRoute(route)
  if (!locale?.prefix) return normalized
  if (normalized === locale.prefix) return '/'
  if (normalized.startsWith(`${locale.prefix}/`)) {
    return normalizeRoute(normalized.slice(locale.prefix.length))
  }
  return normalized
}

export function routePathKey(route: string, i18n: ResolvedI18n | undefined): string {
  return stripLocalePrefix(route, localeFromRoute(route, i18n))
}

export function localizeRoute(pathKey: string, locale: ResolvedLocale): string {
  const normalized = normalizeRoute(pathKey)
  if (!locale.prefix) return normalized
  return normalized === '/' ? locale.prefix : normalizeRoute(`${locale.prefix}${normalized}`)
}

export function localizedRouteForLocale(
  route: string,
  targetLocale: ResolvedLocale,
  i18n: ResolvedI18n | undefined,
  availableRoutes?: ReadonlySet<string>
): string {
  const pathKey = routePathKey(route, i18n)
  const localized = localizeRoute(pathKey, targetLocale)
  if (!availableRoutes || availableRoutes.has(localized)) return localized
  return normalizeRoute(targetLocale.link)
}

export function siteForRoute(
  site: SiteData,
  route: string,
  i18n: ResolvedI18n | undefined
): SiteData {
  const localeSite = localeFromRoute(route, i18n)?.site
  if (!localeSite) return site
  // `base` is a deployment setting; locale copies are resolved before CLI overrides.
  return { ...localeSite, base: site.base }
}

export function themeConfigForRoute(
  themeConfig: ThemeConfig,
  route: string,
  i18n: ResolvedI18n | undefined
): ThemeConfig {
  return localeFromRoute(route, i18n)?.themeConfig ?? themeConfig
}
