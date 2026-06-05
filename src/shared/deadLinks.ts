export type IgnoreDeadLinks =
  | boolean
  | string[]
  | ((href: string, ctx: { from: string; route?: string }) => boolean)

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§/g, '.*')
  return new RegExp(`^${escaped}$`)
}

function matchesPattern(pattern: string, href: string, route?: string): boolean {
  if (pattern === href || (route && pattern === route)) return true
  if (pattern.includes('*')) {
    const re = patternToRegExp(pattern)
    return re.test(href) || (route ? re.test(route) : false)
  }
  return href.includes(pattern) || (route ? route.includes(pattern) : false)
}

export function shouldIgnoreDeadLink(
  href: string,
  ignore: IgnoreDeadLinks | undefined,
  ctx: { from: string; route?: string }
): boolean {
  if (!ignore) return false
  if (ignore === true) return true
  if (typeof ignore === 'function') return ignore(href, ctx)
  return ignore.some((pattern) => matchesPattern(pattern, href, ctx.route))
}
