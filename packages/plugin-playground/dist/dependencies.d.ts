import type { PlaygroundDependencies, PlaygroundPluginOptions } from "./types.js";
export interface DependencyContext {
    allowlist: Set<string>;
    cdnBase: string;
    workspacePackages: Record<string, string>;
}
/** Build dependency resolution context from plugin options. */
export declare function createDependencyContext(options?: PlaygroundPluginOptions): DependencyContext;
/** Resolve user-declared dependencies into an import map for the sandbox iframe. */
export declare function resolveImportMap(dependencies: PlaygroundDependencies, context: DependencyContext): {
    imports: Record<string, string>;
    errors: string[];
};
/** Validate that imports in source only reference allowed packages or virtual files. */
export declare function findDisallowedImports(source: string, virtualPaths: Set<string>, context: DependencyContext): string[];
//# sourceMappingURL=dependencies.d.ts.map