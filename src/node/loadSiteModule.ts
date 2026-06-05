import { loadConfigFromFile, type ConfigEnv } from 'vite'

const ENV: ConfigEnv = { command: 'build', mode: 'production', isPreview: false }

export async function loadSiteModule<T>(absPath: string, root: string): Promise<T> {
  const loaded = await loadConfigFromFile(ENV, absPath, root)
  if (!loaded) {
    throw new Error(`preactpress: failed to load module ${absPath}`)
  }
  return loaded.config as T
}
