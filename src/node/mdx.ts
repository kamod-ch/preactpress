import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import type { Plugin } from "vite";

export function preactPressMdxPlugin(): Plugin {
  return mdx({
    jsxImportSource: "preact",
    remarkPlugins: [remarkFrontmatter],
  }) as Plugin;
}
