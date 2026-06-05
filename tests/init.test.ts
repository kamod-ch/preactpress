import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { init } from '../src/node/init.js'
import { PACKAGE_ROOT } from '../src/node/packageRoot.js'

describe('init', () => {
  it('scaffolds the minimal starter without build artifacts or workspace deps', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-init-'))
    try {
      const result = await init(root)

      await expect(fs.access(path.join(root, 'index.md'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'README.md'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'guide', 'first-five-minutes.md'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'about.md'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'de'))).rejects.toThrow()
      await expect(fs.access(path.join(root, 'interactive.mdx'))).rejects.toThrow()
      await expect(fs.access(path.join(root, '.preactpress', 'config.ts'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'dist'))).rejects.toThrow()
      await expect(fs.access(path.join(root, 'node_modules'))).rejects.toThrow()
      await expect(fs.access(path.join(root, 'pnpm-lock.yaml'))).rejects.toThrow()

      const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')) as {
        devDependencies: { preactpress: string }
      }
      const toolPkg = JSON.parse(
        await fs.readFile(path.join(PACKAGE_ROOT, 'package.json'), 'utf8')
      ) as { version: string }

      expect(pkg.devDependencies.preactpress).toBe(`^${toolPkg.version}`)
      expect(result.preactpressVersion).toBe(toolPkg.version)
      expect(result.root).toBe(root)
      expect(result.template).toBe('default')
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('scaffolds the docs template on request', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-init-docs-'))
    try {
      const result = await init(root, { template: 'docs' })

      await expect(fs.access(path.join(root, 'de', 'index.md'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'interactive.mdx'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'markdown-examples.md'))).resolves.toBeUndefined()

      const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')) as {
        devDependencies: { preactpress: string }
      }
      const toolPkg = JSON.parse(
        await fs.readFile(path.join(PACKAGE_ROOT, 'package.json'), 'utf8')
      ) as { version: string }

      expect(pkg.devDependencies.preactpress).toBe(`^${toolPkg.version}`)
      expect(result.preactpressVersion).toBe(toolPkg.version)
      expect(result.root).toBe(root)
      expect(result.template).toBe('docs')
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })

  it('scaffolds the hono template on request', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preactpress-init-hono-'))
    try {
      const result = await init(root, { template: 'hono' })

      await expect(fs.access(path.join(root, 'index.mdx'))).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'de', 'index.mdx'))).resolves.toBeUndefined()
      await expect(
        fs.access(path.join(root, '.preactpress', 'theme', 'Layout.tsx'))
      ).resolves.toBeUndefined()
      await expect(
        fs.access(path.join(root, '.preactpress', 'theme', 'hono.css'))
      ).resolves.toBeUndefined()
      await expect(fs.access(path.join(root, 'node_modules'))).rejects.toThrow()
      await expect(fs.access(path.join(root, 'pnpm-lock.yaml'))).rejects.toThrow()

      const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')) as {
        devDependencies: { preactpress: string }
      }
      const toolPkg = JSON.parse(
        await fs.readFile(path.join(PACKAGE_ROOT, 'package.json'), 'utf8')
      ) as { version: string }

      expect(pkg.devDependencies.preactpress).toBe(`^${toolPkg.version}`)
      expect(result.preactpressVersion).toBe(toolPkg.version)
      expect(result.root).toBe(root)
      expect(result.template).toBe('hono')
    } finally {
      await fs.rm(root, { recursive: true, force: true })
    }
  })
})
