import { describe, expect, it } from 'vitest'
import { pickMainEntry, publicUrl, routeToOutPath } from '../src/node/build.js'

describe('build helpers', () => {
  it('creates base-aware public URLs', () => {
    expect(publicUrl('/', 'assets/app.js')).toBe('/assets/app.js')
    expect(publicUrl('/docs', 'assets/app.js')).toBe('/docs/assets/app.js')
    expect(publicUrl('/docs/', '/assets/app.js')).toBe('/docs/assets/app.js')
  })

  it('creates canonical URLs with the configured base', () => {
    expect(publicUrl('/docs', '/guide/')).toBe('/docs/guide/')
  })

  it('maps routes to static HTML paths', () => {
    expect(routeToOutPath('/')).toBe('index.html')
    expect(routeToOutPath('/guide')).toBe('guide/index.html')
  })

  it('picks an explicit or fallback entry from the Vite manifest', () => {
    expect(
      pickMainEntry({
        main: { file: 'assets/main.js', css: ['assets/main.css'] }
      })
    ).toEqual({ file: 'assets/main.js', css: ['assets/main.css'] })

    expect(
      pickMainEntry({
        other: { file: 'assets/other.js', isEntry: true }
      })
    ).toEqual({ file: 'assets/other.js', css: [] })
  })
})
