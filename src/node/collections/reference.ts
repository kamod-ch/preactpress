import { z } from "zod";

const REF_PREFIX = "@ref:";

/** Zod schema marker for a cross-collection reference resolved at build time. */
export function reference(collectionName: string): z.ZodString {
  return z.string().describe(`${REF_PREFIX}${collectionName}`);
}

export function referenceCollectionName(description: string | undefined): string | undefined {
  if (!description?.startsWith(REF_PREFIX)) return undefined;
  const name = description.slice(REF_PREFIX.length).trim();
  return name || undefined;
}

export function isReferenceField(
  references: Record<string, string> | undefined,
  field: string,
): boolean {
  return Boolean(references?.[field]);
}
