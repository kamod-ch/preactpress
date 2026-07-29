import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { COMPONENT_MANIFEST_VERSION } from "../types/index.js";
import { componentsFromApiManifest } from "./from-api-manifest.js";
import { extractComponentEntry } from "./typescript.js";
function hashPayload(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
export async function buildComponentManifest(options) {
  const components = {};
  if (options.apiManifestPath) {
    try {
      const raw = await fs.readFile(options.apiManifestPath, "utf8");
      const apiManifest = JSON.parse(raw);
      Object.assign(components, componentsFromApiManifest(apiManifest));
    } catch {
      /* optional typedoc manifest */
    }
  }
  for (const item of options.catalog ?? []) {
    const entry = extractComponentEntry({
      root: options.root,
      source: item.source,
      exportName: item.exportName,
      tsconfig: options.tsconfig,
      gitRemote: options.gitRemote,
      gitBranch: options.gitBranch,
    });
    components[item.component ?? item.exportName] = entry;
  }
  const sourceHash = hashPayload(
    JSON.stringify({ catalog: options.catalog, keys: Object.keys(components).sort() }),
  );
  return {
    version: COMPONENT_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    sourceHash,
    components,
  };
}
export async function defaultApiManifestPath(configDir) {
  return path.join(configDir, "typedoc-manifest.json");
}
//# sourceMappingURL=generate.js.map
