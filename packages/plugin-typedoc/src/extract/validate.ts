import fs from "node:fs";
import path from "node:path";

export class TypedocEntryError extends Error {
  readonly entries: string[];

  constructor(message: string, entries: string[]) {
    super(message);
    this.name = "TypedocEntryError";
    this.entries = entries;
  }
}

export function validateEntryPoints(root: string, entries: string[]): void {
  const missing: string[] = [];
  for (const entry of entries) {
    const abs = path.resolve(root, entry);
    if (!fs.existsSync(abs)) {
      missing.push(entry);
    }
  }
  if (missing.length > 0) {
    throw new TypedocEntryError(
      `typedocPlugin: invalid entry point(s): ${missing.join(", ")}. Expected existing TypeScript files.`,
      missing,
    );
  }
}

export function resolveTsconfig(root: string, tsconfig?: string): string | undefined {
  if (!tsconfig) return undefined;
  const abs = path.resolve(root, tsconfig);
  if (!fs.existsSync(abs)) {
    throw new TypedocEntryError(`typedocPlugin: tsconfig not found: ${tsconfig}`, [tsconfig]);
  }
  return abs;
}
