import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { mdFileToRoute } from '../src/node/plugin.js'

describe('mdFileToRoute', () => {
  const root = path.resolve('/site')

  it('maps index files and nested markdown files to clean routes', () => {
    expect(mdFileToRoute(root, path.join(root, 'index.md'))).toBe('/')
    expect(mdFileToRoute(root, path.join(root, 'guide', 'index.md'))).toBe('/guide')
    expect(mdFileToRoute(root, path.join(root, 'guide', 'intro.md'))).toBe('/guide/intro')
  })
})
