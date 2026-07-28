import type { Plugin } from "vite";
import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import type { PlaygroundPluginOptions } from "./types.js";

const PLAYGROUND_TAG_RE = /<Playground\b/;
const PLAYGROUND_IMPORT = `import { Playground } from "@preactpress/plugin-playground/mdx";`;

function playgroundMdxAutoImportPlugin(): Plugin {
  return {
    name: "preactpress:playground-mdx-auto-import",
    enforce: "pre",
    transform(code, id) {
      if (!id.split("?")[0]?.endsWith(".mdx")) return undefined;
      if (!PLAYGROUND_TAG_RE.test(code)) return undefined;
      if (code.includes("@preactpress/plugin-playground")) return undefined;
      return `${PLAYGROUND_IMPORT}\n${code}`;
    },
  };
}

/** Official PreactPress plugin for live Preact code playgrounds in MDX. */
export function playgroundPlugin(options: PlaygroundPluginOptions = {}): PreactPressPlugin {
  return {
    name: "preactpress:playground",
    client: "@preactpress/plugin-playground/client",
    extendHead() {
      return [
        [
          "link",
          {
            rel: "preconnect",
            href: "https://esm.sh",
            crossorigin: "",
          },
        ],
      ];
    },
    config(config) {
      return {
        vite: {
          plugins: [playgroundMdxAutoImportPlugin()],
        },
      };
    },
  };
}

export type { PlaygroundPluginOptions, PlaygroundProps } from "./types.js";
export { resolvePlaygroundFiles, serializeFilesForDisplay } from "./files.js";
export { createDependencyContext, resolveImportMap } from "./dependencies.js";
export { renderPlaygroundFallbackHtml } from "./static.js";
