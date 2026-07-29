export declare class TypedocEntryError extends Error {
  readonly entries: string[];
  constructor(message: string, entries: string[]);
}
export declare function validateEntryPoints(root: string, entries: string[]): void;
export declare function resolveTsconfig(root: string, tsconfig?: string): string | undefined;
//# sourceMappingURL=validate.d.ts.map
