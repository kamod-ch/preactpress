import path from "node:path";
import { normalizePath } from "vite";
import type {
  ResolvedConfig,
  ResolvedVersion,
  ResolvedVersions,
  ThemeConfig,
  UserVersionsConfig,
  VersionConfig,
  VersionItemConfig,
  VersionsConfig,
} from "./siteConfig.js";
import { DEFAULT_VERSION_LABELS, versionPrefixForValue } from "../shared/version.js";
import { normalizeRoute } from "../shared/route.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isStructuredVersionsConfig(value: unknown): value is VersionsConfig {
  return isPlainObject(value) && Array.isArray(value.items);
}

function legacyPrefixForKey(key: string): string {
  return key === "latest" ? "" : normalizeRoute(`/${key}`);
}

function normalizeVersionItems(input: UserVersionsConfig | undefined): {
  items: VersionItemConfig[];
  current?: string;
  aliases?: Record<string, string>;
  dir?: string;
  currentDir?: string;
  labels?: VersionsConfig["labels"];
} | null {
  if (!input) return null;
  if (isStructuredVersionsConfig(input)) {
    return {
      items: input.items,
      current: input.current,
      aliases: input.aliases,
      dir: input.dir,
      currentDir: input.currentDir,
      labels: input.labels,
    };
  }
  const items: VersionItemConfig[] = Object.entries(input).map(([key, version]) => ({
    value: key,
    label: version.label,
    link: version.link,
    srcDir: version.srcDir,
    themeConfig: version.themeConfig,
    status: key === "latest" ? "current" : "archived",
  }));
  return {
    items,
    current: input.latest ? "latest" : items[0]?.value,
    aliases: input.latest ? { latest: "latest" } : undefined,
  };
}

export function resolveVersionsConfig(
  input: UserVersionsConfig | undefined,
  ctx: { root: string; srcDir: string; themeConfig: ThemeConfig },
): ResolvedVersions {
  const parsed = normalizeVersionItems(input);
  if (!parsed || parsed.items.length === 0) {
    return {
      enabled: false,
      current: "",
      defaultVersionKey: "latest",
      dir: "versions",
      currentDir: "current",
      labels: { ...DEFAULT_VERSION_LABELS },
      aliases: {},
      versions: [],
    };
  }

  const dir = parsed.dir ?? "versions";
  const currentDir = parsed.currentDir ?? "current";
  const labels = {
    switcher: parsed.labels?.switcher ?? DEFAULT_VERSION_LABELS.switcher,
    current: parsed.labels?.current ?? DEFAULT_VERSION_LABELS.current,
    archived: parsed.labels?.archived ?? DEFAULT_VERSION_LABELS.archived,
    archivedBanner: parsed.labels?.archivedBanner ?? DEFAULT_VERSION_LABELS.archivedBanner,
  };
  const aliases = parsed.aliases ?? {};
  const currentValue =
    parsed.current ??
    parsed.items.find((item) => item.status === "current")?.value ??
    parsed.items[0]?.value;

  const resolvedItems: ResolvedVersion[] = parsed.items.map((item) => {
    const isCurrent = item.value === currentValue || item.status === "current";
    const status = item.status ?? (isCurrent ? "current" : "archived");
    const prefix = versionPrefixForValue(item.value, isCurrent, dir);
    const srcDir = normalizePath(
      path.resolve(ctx.root, item.srcDir ?? (isCurrent ? currentDir : path.join(dir, item.value))),
    );
    return {
      key: item.value,
      value: item.value,
      label: item.label,
      link: item.link ?? `${prefix || ""}/`,
      prefix,
      status,
      isCurrent,
      isAlias: false,
      srcDir,
      themeConfig: {
        ...ctx.themeConfig,
        ...item.themeConfig,
      },
    };
  });

  for (const current of resolvedItems.filter((item) => item.isCurrent)) {
    current.status = "current";
  }

  const aliasEntries: ResolvedVersion[] = [];
  for (const [aliasKey, aliasValue] of Object.entries(aliases)) {
    const target = resolvedItems.find((item) => item.value === aliasValue);
    if (!target) continue;
    aliasEntries.push({
      key: aliasKey,
      value: target.value,
      label: target.label,
      link: target.link,
      prefix: target.prefix,
      status: target.status,
      isCurrent: target.isCurrent,
      isAlias: true,
      srcDir: target.srcDir,
      themeConfig: target.themeConfig,
    });
  }

  const defaultVersionKey =
    Object.keys(aliases).find((key) => aliases[key] === currentValue) ??
    (aliases.latest ? "latest" : currentValue);

  return {
    enabled: true,
    current: currentValue,
    defaultVersionKey,
    dir,
    currentDir,
    labels,
    aliases,
    versions: [...resolvedItems, ...aliasEntries],
  };
}

export function versionContentRoots(site: Pick<ResolvedConfig, "versions">): ResolvedVersion[] {
  if (!site.versions.enabled) return [];
  return site.versions.versions.filter((version) => !version.isAlias);
}

/** Resolve legacy keyed version config for tests and backward compatibility. */
export function resolveLegacyVersions(
  userVersions: Record<string, VersionConfig> | undefined,
  themeConfig: ThemeConfig,
  root: string,
  srcDir: string,
): ResolvedVersions {
  return resolveVersionsConfig(userVersions, { root, srcDir, themeConfig });
}
