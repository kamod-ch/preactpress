import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export async function init(targetRoot: string): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const templateDir = path.resolve(here, '../../template')
  await fs.cp(templateDir, targetRoot, { recursive: true })
}
