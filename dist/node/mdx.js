import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
export function preactPressMdxPlugin() {
    return mdx({
        jsxImportSource: 'preact',
        remarkPlugins: [remarkFrontmatter]
    });
}
//# sourceMappingURL=mdx.js.map