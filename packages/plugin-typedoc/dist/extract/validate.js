import fs from "node:fs";
import path from "node:path";
export class TypedocEntryError extends Error {
  entries;
  constructor(message, entries) {
    super(message);
    this.name = "TypedocEntryError";
    this.entries = entries;
  }
}
export function validateEntryPoints(root, entries) {
  const missing = [];
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
export function resolveTsconfig(root, tsconfig) {
  if (!tsconfig) return undefined;
  const abs = path.resolve(root, tsconfig);
  if (!fs.existsSync(abs)) {
    throw new TypedocEntryError(`typedocPlugin: tsconfig not found: ${tsconfig}`, [tsconfig]);
  }
  return abs;
}
//# sourceMappingURL=validate.js.map
