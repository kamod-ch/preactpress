import type { ModuleNode, ViteDevServer } from 'vite'
import { normalizePath } from 'vite'

const CLIENT_ALIAS = 'preactpress/app'

export function isCssModuleId(id: string): boolean {
  return /\.css(?:\?|$)/.test(id)
}

/** Collect stylesheet URLs reachable from the client entry module graph. */
export function collectCssUrlsFromModule(entryMod: ModuleNode): string[] {
  const hrefs = new Set<string>()
  const seen = new Set<ModuleNode>()
  const stack: ModuleNode[] = [entryMod]

  while (stack.length > 0) {
    const mod = stack.pop()!
    if (seen.has(mod)) continue
    seen.add(mod)

    const id = mod.id ?? ''
    if (id && isCssModuleId(id)) {
      const url = mod.url ?? id
      if (url) hrefs.add(url)
      continue
    }

    for (const imported of mod.importedModules) {
      stack.push(imported)
    }
  }

  return [...hrefs].sort()
}

async function resolveClientEntryId(server: ViteDevServer): Promise<string | undefined> {
  const resolved = await server.pluginContainer.resolveId(
    CLIENT_ALIAS,
    normalizePath(`${server.config.root}/index.html`)
  )
  return resolved?.id
}

/** Transform client modules so Vite registers CSS dependencies on the module graph. */
async function warmClientModuleGraph(
  server: ViteDevServer,
  entryMod: ModuleNode
): Promise<void> {
  const seen = new Set<ModuleNode>()
  const queue: ModuleNode[] = [entryMod]

  while (queue.length > 0) {
    const mod = queue.shift()!
    if (seen.has(mod)) continue
    seen.add(mod)

    const id = mod.id ?? ''
    if (id && !isCssModuleId(id)) {
      try {
        await server.transformRequest(id)
      } catch {
        /* optional virtual / external modules */
      }
    }

    for (const imported of mod.importedModules) {
      if (!seen.has(imported)) queue.push(imported)
    }
  }
}

/** Warm the client graph and return dev stylesheet hrefs for SSR HTML. */
export async function collectDevStylesheetHrefs(server: ViteDevServer): Promise<string[]> {
  const entryId = await resolveClientEntryId(server)
  if (!entryId) return []

  await server.transformRequest(entryId)

  const entryMod =
    server.moduleGraph.getModuleById(entryId) ??
    (await server.moduleGraph.getModuleByUrl(entryId))

  if (!entryMod) return []

  await warmClientModuleGraph(server, entryMod)
  return collectCssUrlsFromModule(entryMod)
}
