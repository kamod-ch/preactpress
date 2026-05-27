import { describe, expect, it } from 'vitest'
import { mapConcurrent, pickMainEntry, publicUrl, routeToOutPath } from '../src/node/build.js'

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

  it('maps work with a concurrency limit while preserving order', async () => {
    let active = 0
    let maxActive = 0
    const out = await mapConcurrent([1, 2, 3, 4], 2, async (n) => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await Promise.resolve()
      active -= 1
      return n * 2
    })

    expect(out).toEqual([2, 4, 6, 8])
    expect(maxActive).toBeLessThanOrEqual(2)
  })
})
