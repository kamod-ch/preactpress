import path from "node:path";
import { glob } from "tinyglobby";
import type { ZodType } from "zod";
import { mdFileToRoute } from "../content.js";
import { readMarkdownMetadata } from "../markdown.js";
import type { SiteConfig } from "../siteConfig.js";
import { publicUrl } from "../../shared/url.js";
import { isReferenceField, referenceCollectionName } from "./reference.js";
import { resolveSortComparator } from "./sort.js";
import { formatZodError } from "./validation.js";
import type {
  CollectionDefinition,
  CollectionEntry,
  CollectionFilter,
  CollectionLoader,
  CollectionSortFn,
  CollectionSortOption,
  LoadCollectionOptions,
  ResolvedReference,
} from "./types.js";

const CONTENT_IGNORE = ["**/node_modules/**", "**/.preactpress/**"];

function contentIgnore(site: SiteConfig): string[] {
  return [...CONTENT_IGNORE, ...(site.srcExclude ?? [])];
}

function collectionGlobPatterns(def: CollectionDefinition): string[] {
  if (def.patterns?.length) return def.patterns;
  const dir = def.directory.replace(/\/+$/, "");
  return [`${dir}/**/*.{md,mdx}`];
}

function entryIdFromFile(def: CollectionDefinition, srcDir: string, file: string): string {
  const rel = path.relative(srcDir, file).split(path.sep).join("/");
  const withoutExt = rel.replace(/\.(mdx|md)$/, "").replace(/\/index$/, "");

  if (def.directory) {
    const prefix = `${def.directory.replace(/\/+$/, "")}/`;
    if (withoutExt.startsWith(prefix)) {
      return withoutExt.slice(prefix.length);
    }
  }

  return withoutExt.includes("/") ? withoutExt : path.basename(withoutExt);
}

function isDraftEntry(data: Record<string, unknown>): boolean {
  return data.draft === true;
}

function isScheduledEntry(data: Record<string, unknown>, now = Date.now()): boolean {
  const raw = data.date ?? data.publishedAt ?? data.publishDate;
  if (!raw) return false;
  const time =
    raw instanceof Date ? raw.getTime() : typeof raw === "string" ? Date.parse(raw) : Number.NaN;
  return !Number.isNaN(time) && time > now;
}

function matchesFilter(data: Record<string, unknown>, filter: CollectionFilter): boolean {
  for (const [key, expected] of Object.entries(filter)) {
    if (data[key] !== expected) return false;
  }
  return true;
}

function referenceFieldsFromSchema(schema: ZodType): Record<string, string> {
  const refs: Record<string, string> = {};
  const shape = (schema as { shape?: Record<string, ZodType> }).shape;
  if (!shape) return refs;

  for (const [field, fieldSchema] of Object.entries(shape)) {
    const collectionName = referenceCollectionName(fieldSchema.description);
    if (collectionName) refs[field] = collectionName;
  }
  return refs;
}

function mergedReferences(def: CollectionDefinition): Record<string, string> {
  return {
    ...referenceFieldsFromSchema(def.schema),
    ...(def.references ?? {}),
  };
}

async function globCollectionFiles(def: CollectionDefinition, site: SiteConfig): Promise<string[]> {
  const matched = new Set<string>();
  for (const pattern of collectionGlobPatterns(def)) {
    if (pattern.startsWith("!")) continue;
    const hits = await glob([pattern], {
      cwd: site.srcDir,
      absolute: true,
      ignore: contentIgnore(site),
    });
    for (const hit of hits) matched.add(hit);
  }
  return [...matched].sort();
}

function validateEntry<TSchema extends ZodType>(
  schema: TSchema,
  file: string,
  frontmatter: Record<string, unknown>,
) {
  const parsed = schema.safeParse(frontmatter);
  if (!parsed.success) throw formatZodError(file, parsed.error);
  return parsed.data;
}

function buildEntry<TData>(
  def: CollectionDefinition,
  site: SiteConfig,
  file: string,
  data: TData,
): CollectionEntry<TData> {
  const route = mdFileToRoute(site.srcDir, file);
  const relativePath = path.relative(site.srcDir, file).split(path.sep).join("/");
  return {
    id: entryIdFromFile(def, site.srcDir, file),
    route,
    relativePath,
    file,
    url: publicUrl(site.site.base, route === "/" ? "/" : route),
    data,
  };
}

function resolveEntryReferences(
  entry: CollectionEntry,
  references: Record<string, string>,
  registryEntries: Map<string, Map<string, CollectionEntry>>,
): CollectionEntry {
  const data = { ...(entry.data as Record<string, unknown>) };

  for (const [field, collectionName] of Object.entries(references)) {
    const raw = data[field];
    if (typeof raw !== "string" || !raw.trim()) continue;

    const lookup = registryEntries.get(collectionName);
    const resolved = lookup?.get(raw) ?? lookup?.get(raw.trim());
    if (!resolved) {
      throw new Error(
        `preactpress: ${entry.relativePath} references missing ${collectionName} entry "${raw}"`,
      );
    }

    const ref: ResolvedReference = {
      id: resolved.id,
      route: resolved.route,
      url: resolved.url,
      data: resolved.data,
    };
    data[field] = ref;
  }

  return { ...entry, data };
}

export async function loadCollectionEntries<TData = unknown>(
  def: CollectionDefinition,
  site: SiteConfig,
  options: LoadCollectionOptions<TData> = {},
  registryEntries: Map<string, Map<string, CollectionEntry>> = new Map(),
): Promise<CollectionEntry<TData>[]> {
  const files = await globCollectionFiles(def, site);
  const includeDrafts = options.includeDrafts ?? def.includeDrafts ?? false;
  const sort = resolveSortComparator(
    (options.sort ?? def.sort ?? "route:asc") as CollectionSortOption | CollectionSortFn,
  );
  const references = mergedReferences(def);
  const now = Date.now();

  const entries: CollectionEntry<TData>[] = [];

  for (const file of files) {
    const { meta } = readMarkdownMetadata(file);
    const data = validateEntry(def.schema, file, meta) as TData;
    const record = data as Record<string, unknown>;

    if (!includeDrafts && (isDraftEntry(record) || isScheduledEntry(record, now))) {
      continue;
    }

    if (options.filter && !matchesFilter(record, options.filter)) {
      continue;
    }

    entries.push(buildEntry(def, site, file, data));
  }

  entries.sort(sort);

  if (Object.keys(references).length === 0) {
    return entries;
  }

  return entries.map((entry) =>
    resolveEntryReferences(entry, references, registryEntries),
  ) as CollectionEntry<TData>[];
}

export async function runCollectionLoader(
  loader: CollectionLoader,
  site: SiteConfig,
  registry: Map<string, CollectionDefinition>,
): Promise<unknown> {
  const def = registry.get(loader.collectionName);
  if (!def) {
    const known = [...registry.keys()].sort().join(", ") || "(none)";
    throw new Error(
      `preactpress: Unknown collection "${loader.collectionName}". Registered collections: ${known}`,
    );
  }

  const references = mergedReferences(def);
  const registryEntries = new Map<string, Map<string, CollectionEntry>>();

  for (const collectionName of new Set(Object.values(references))) {
    const referenced = registry.get(collectionName);
    if (!referenced) {
      throw new Error(
        `preactpress: Collection "${loader.collectionName}" references unknown collection "${collectionName}"`,
      );
    }
    const entries = await loadCollectionEntries(referenced, site, {}, registryEntries);
    registryEntries.set(collectionName, new Map(entries.map((entry) => [entry.id, entry])));
  }

  const entries = await loadCollectionEntries(def, site, loader.options ?? {}, registryEntries);

  const transform = loader.options?.transform;
  if (transform) return transform(entries);
  return entries;
}

/** Load every registered collection into an id-indexed map (used by tests and tooling). */
export async function loadAllCollectionEntries(
  registry: Map<string, CollectionDefinition>,
  site: SiteConfig,
): Promise<Map<string, CollectionEntry[]>> {
  const loaded = new Map<string, CollectionEntry[]>();
  const registryEntries = new Map<string, Map<string, CollectionEntry>>();

  for (const [name, def] of [...registry.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const entries = await loadCollectionEntries(def, site, {}, registryEntries);
    loaded.set(name, entries);
    registryEntries.set(name, new Map(entries.map((entry) => [entry.id, entry])));
  }

  return loaded;
}

export {
  collectionGlobPatterns,
  entryIdFromFile,
  isDraftEntry,
  isScheduledEntry,
  matchesFilter,
  isReferenceField,
};
