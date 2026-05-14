export declare function publicUrl(siteBase: string, file: string): string;
export declare function pickMainEntry(manifest: Record<string, {
    file?: string;
    css?: string[];
    isEntry?: boolean;
}>): {
    file: string;
    css: string[];
};
export declare function routeToOutPath(route: string): string;
export declare function build(root?: string, opts?: {
    base?: string;
}): Promise<void>;
//# sourceMappingURL=build.d.ts.map