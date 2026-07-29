import { createServer, type ViteDevServer } from "vite";

const serverCache = new Map<string, ViteDevServer>();

async function getModuleLoader(root: string): Promise<ViteDevServer> {
  let server = serverCache.get(root);
  if (!server) {
    server = await createServer({
      configFile: false,
      root,
      logLevel: "error",
      server: { middlewareMode: true },
      optimizeDeps: { noDiscovery: true },
    });
    serverCache.set(root, server);
  }
  return server;
}

/** Load a site module and return all named exports (for content.config.ts). */
export async function loadSiteModuleExports(
  absPath: string,
  root: string,
): Promise<Record<string, unknown>> {
  const server = await getModuleLoader(root);
  const mod = await server.ssrLoadModule(absPath);
  return mod as Record<string, unknown>;
}

export async function closeSiteModuleLoaders(): Promise<void> {
  for (const server of serverCache.values()) {
    await server.close();
  }
  serverCache.clear();
}
