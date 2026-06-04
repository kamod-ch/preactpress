import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { normalizeBase, resolveConfig } from '../src/node/config.js'

const tempRoots: string[] = []

async function makeSite(config: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-config-'))
  tempRoots.push(root)
  await fs.mkdir(path.join(root, '.preactpress'), { recursive: true })
  await fs.writeFile(path.join(root, '.preactpress', 'config.ts'), config, 'utf8')
  return root
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })))
})

describe('config', () => {
  it('normalizes site bases', () => {
    expect(normalizeBase('docs/')).toBe('/docs')
    expect(normalizeBase('/docs/')).toBe('/docs')
    expect(normalizeBase('/')).toBe('/')
  })

  it('resolves defaults and markdown options', async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', base: 'docs/' },
      markdown: { html: true }
    }`)

    const config = await resolveConfig(root)
    expect(config.site).toMatchObject({ title: 'Docs', base: '/docs' })
    expect(config.markdown).toEqual({
      html: true,
      linkify: true,
      typographer: true
    })
  })

  it('loads themeConfig.logo', async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'Docs' },
      themeConfig: { logo: '/brand.svg', nav: [{ text: 'Home', link: '/' }] }
    }`)
    const config = await resolveConfig(root)
    expect(config.themeConfig.logo).toBe('/brand.svg')
  })

  it('resolves locale-specific site and theme config', async () => {
    const root = await makeSite(`export default {
      site: { title: 'Docs', description: 'English docs' },
      themeConfig: { search: true, nav: [{ text: 'Home', link: '/' }] },
      locales: {
        root: { label: 'English', lang: 'en' },
        de: {
          label: 'Deutsch',
          lang: 'de',
          title: 'Doku',
          description: 'Deutsche Doku',
          themeConfig: { nav: [{ text: 'Start', link: '/de' }] }
        }
      }
    }`)

    const config = await resolveConfig(root)
    expect(config.i18n?.locales.map((locale) => [locale.key, locale.prefix, locale.link])).toEqual([
      ['root', '', '/'],
      ['de', '/de', '/de/']
    ])
    expect(config.i18n?.locales[1].site).toMatchObject({
      title: 'Doku',
      description: 'Deutsche Doku',
      lang: 'de'
    })
    expect(config.i18n?.locales[1].themeConfig).toMatchObject({
      search: true,
      nav: [{ text: 'Start', link: '/de' }]
    })
  })
})
