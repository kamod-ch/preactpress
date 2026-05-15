export function publicUrl(siteBase: string, file: string): string {
  const b = siteBase === '/' ? '' : siteBase.replace(/\/$/, '')
  const f = file.startsWith('/') ? file : `/${file}`
  return `${b}${f}`
}

export function canonicalUrl(opts: {
  url?: string
  base: string
  route: string
}): string {
  const path = publicUrl(opts.base, opts.route === '/' ? '/' : `${opts.route}/`)
  return opts.url ? `${opts.url}${path}` : path
}
