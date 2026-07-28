import path from "node:path";
import { generateApiReference, writeGeneratedPages, writeStructuredManifest, } from "./extract/generate.js";
import { mergePathSidebar, navItemFromManifest, sidebarFromManifest } from "./render/sidebar.js";
function hasNavLink(nav, link) {
    if (!nav)
        return false;
    for (const item of nav) {
        if (item.link === link)
            return true;
        if (item.items && hasNavLink(item.items, link))
            return true;
    }
    return false;
}
/** Official PreactPress plugin for TypeDoc API reference pages. */
export function typedocPlugin(options) {
    if (!options.entries?.length) {
        throw new Error("typedocPlugin(options): `entries` must include at least one TypeScript entry point.");
    }
    let generation;
    const runGeneration = (root, srcDir, cacheDir, configDir) => {
        if (!generation) {
            generation = (async () => {
                const result = await generateApiReference({ root, srcDir, cacheDir }, options);
                await writeGeneratedPages(srcDir, result);
                await writeStructuredManifest(configDir, result.manifest);
                return result;
            })();
        }
        return generation;
    };
    return {
        name: "preactpress:typedoc",
        enforce: "pre",
        async config(config) {
            const root = process.cwd();
            const srcDir = path.resolve(root, config.srcDir ?? ".");
            const cacheDir = path.resolve(root, config.cacheDir ?? "node_modules/.preactpress");
            const configDir = path.resolve(root, ".preactpress");
            const result = await runGeneration(root, srcDir, cacheDir, configDir);
            const sidebar = sidebarFromManifest(result.manifest);
            const navLink = navItemFromManifest(result.manifest);
            return {
                ...config,
                apiDocs: {
                    enabled: true,
                    tsconfig: options.tsconfig,
                    outDir: options.output ?? "reference/api",
                },
                themeConfig: {
                    ...config.themeConfig,
                    sidebar: mergePathSidebar(config.themeConfig?.sidebar, result.manifest.baseRoute, sidebar),
                    nav: hasNavLink(config.themeConfig?.nav, navLink.link)
                        ? config.themeConfig?.nav
                        : [...(config.themeConfig?.nav ?? []), navLink],
                },
            };
        },
        async configResolved(config) {
            await runGeneration(config.root, config.srcDir, config.cacheDir, config.configDir);
            config.logger.info(`typedoc: generated ${options.entries.length} entry point(s) under ${options.output ?? "reference/api"}`, { timestamp: true });
        },
    };
}
export { generateApiReference, writeGeneratedPages } from "./extract/generate.js";
export { renderApiDocs } from "./render/markdown.js";
export { mergePathSidebar, navItemFromManifest, sidebarFromManifest } from "./render/sidebar.js";
export { joinRoute, slugifySegment, symbolId } from "./render/slugs.js";
export { relativeHref } from "./render/links.js";
//# sourceMappingURL=index.js.map