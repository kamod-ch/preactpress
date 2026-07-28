import type { ZodType } from "zod";
import type { CollectionDefinition } from "./types.js";

export interface DefineCollectionOptions<TSchema extends ZodType> {
  directory?: string;
  patterns?: string[];
  schema: TSchema;
  includeDrafts?: boolean;
  sort?: CollectionDefinition<TSchema>["sort"];
  references?: Record<string, string>;
}

/** Declare a typed content collection backed by markdown files in `directory`. */
export function defineCollection<TSchema extends ZodType>(
  options: DefineCollectionOptions<TSchema>,
): CollectionDefinition<TSchema> {
  if (!options.directory && !options.patterns?.length) {
    throw new Error("preactpress: defineCollection requires `directory` or `patterns`");
  }

  const directory = options.directory
    ? options.directory.replace(/\\/g, "/").replace(/\/+$/, "")
    : "";

  return {
    __kind: "collection",
    directory,
    patterns: options.patterns,
    schema: options.schema,
    includeDrafts: options.includeDrafts,
    sort: options.sort,
    references: options.references,
  };
}

export function isCollectionDefinition(value: unknown): value is CollectionDefinition {
  return Boolean(
    value && typeof value === "object" && (value as CollectionDefinition).__kind === "collection",
  );
}

export { z } from "zod";
