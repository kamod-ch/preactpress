import fs from "node:fs/promises";
import path from "node:path";
const VIRTUAL_ID = "virtual:preactpress-component-manifest";
const RESOLVED_ID = "\0virtual:preactpress-component-manifest";
export function componentManifestVirtualPlugin(manifest) {
  return {
    name: "preactpress-component-manifest",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export const componentManifest = ${JSON.stringify(manifest)};`;
    },
  };
}
export async function writeComponentManifest(configDir, manifest) {
  await fs.mkdir(configDir, { recursive: true });
  const target = path.join(configDir, "component-manifest.json");
  await fs.writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return target;
}
export { VIRTUAL_ID };
//# sourceMappingURL=vite-manifest-plugin.js.map
