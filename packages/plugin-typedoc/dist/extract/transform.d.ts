import { type ProjectReflection } from "typedoc";
import type { ApiManifest } from "../types/index.js";
export interface TransformContext {
    root: string;
    baseRoute: string;
    outputDir: string;
    sourceHash: string;
    includePrivate: boolean;
    sourceLinks: boolean;
    gitRemote?: string;
    gitBranch?: string;
    groupBy: "module" | "kind";
    typeToString: (type: import("typedoc").Type | undefined) => string;
}
export declare function projectToManifest(project: ProjectReflection, ctx: TransformContext): ApiManifest;
export declare function convertTypeDocProject(options: {
    root: string;
    entries: string[];
    tsconfig?: string;
    includePrivate: boolean;
    sourceHash: string;
    baseRoute: string;
    outputDir: string;
    sourceLinks: boolean;
    gitRemote?: string;
    gitBranch?: string;
    groupBy: "module" | "kind";
}): Promise<ApiManifest>;
//# sourceMappingURL=transform.d.ts.map