import type {
  PlaygroundDependencies,
  PlaygroundFiles,
  PlaygroundProps,
  ResolvedPlaygroundState,
} from "./types.js";
/** Normalize `code` / `files` props into a consistent virtual file tree. */
export declare function resolvePlaygroundFiles(
  props: Pick<PlaygroundProps, "code" | "files" | "entry">,
): ResolvedPlaygroundState;
/** Merge user dependencies with defaults required for Preact TSX examples. */
export declare function mergeDependencies(
  user: PlaygroundDependencies | undefined,
  defaults?: PlaygroundDependencies,
): PlaygroundDependencies;
/** Serialize files for SSR fallback and copy actions. */
export declare function serializeFilesForDisplay(files: PlaygroundFiles, entry: string): string;
//# sourceMappingURL=files.d.ts.map
