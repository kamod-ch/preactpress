import { hydrate } from 'preact'
import { App } from './app.js'

function currentRoute(): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''
  let p = window.location.pathname
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/'
  if (!p.startsWith('/')) p = `/${p}`
  return (p.replace(/\/$/, '') || '/') as string
}

const el = document.getElementById('app')
if (el) {
  const initial =
    (window as unknown as { __PREACTPRESS_ROUTE__?: string })
      .__PREACTPRESS_ROUTE__ ?? currentRoute()
  hydrate(<App routePath={initial} />, el)
}
