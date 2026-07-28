import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "tinyglobby";
import type {
  HeadTag,
  LocaleConfig,
  MarkdownConfig,
  NavItem,
  SidebarGroup,
  ThemeConfig,
  UserConfig,
} from "../../../siteConfig.js";
import type {
  MigrationManualTask,
  MigrationOptions,
  MigrationPlan,
  MigrationWarning,
  PlannedFile,
} from "../../types.js";

export interface VitePressProjectLayout {
  sourceRoot: string;
  vitepressDir: string;
  contentDir: string;
  publicDir: string | null;
  configPath: string | null;
}

export interface ParsedVitePressConfig {
  title?: string;
  description?: string;
  lang?: string;
  base?: string;
  srcDir?: string;
  cleanUrls?: boolean;
  head?: HeadTag[];
  themeConfig?: ThemeConfig;
  locales?: Record<string, LocaleConfig & { themeConfig?: ThemeConfig }>;
  markdown?: MarkdownConfig;
  sitemap?: { hostname?: string };
  rewrites?: Record<string, string>;
}

const VUE_COMPONENT_RE = /<([A-Z][A-Za-z0-9]*)\b[^>]*(?:\/>|>[\s\S]*?<\/\1>)/g;
const VUE_DIRECTIVE_RE = /\s(v-[a-z-]+|@[a-z-]+|:([a-z-]+))=/;
const SCRIPT_SETUP_RE = /<script\s+setup[^>]*>/i;
const IMPORT_VUE_RE = /from\s+['"]vue['"]/;
const VP_BADGE_RE = /<Badge\s[^>]*\/>/g;
const VP_CUSTOM_BLOCK_RE = /<<< @\/(.+)/g;
const FRONTMATTER_VUE_RE = /^\s*(?:layout|sidebar):\s*[^\n]+$/m;

export async function detectVitePressProject(sourceRoot: string): Promise<boolean> {
  const layout = await resolveVitePressLayout(sourceRoot);
  return layout.configPath !== null;
}

export async function resolveVitePressLayout(sourceRoot: string): Promise<VitePressProjectLayout> {
  const candidates = [
    path.join(sourceRoot, ".vitepress"),
    path.join(sourceRoot, "docs", ".vitepress"),
  ];

  let vitepressDir: string | null = null;
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        vitepressDir = candidate;
        break;
      }
    } catch {
      // continue
    }
  }

  if (!vitepressDir) {
    return {
      sourceRoot,
      vitepressDir: path.join(sourceRoot, ".vitepress"),
      contentDir: sourceRoot,
      publicDir: null,
      configPath: null,
    };
  }

  const projectRoot = path.dirname(vitepressDir);
  const configPath = await findConfigFile(vitepressDir);
  let parsed: ParsedVitePressConfig = {};
  if (configPath) {
    parsed = await loadVitePressConfig(configPath);
  }

  const contentDir = parsed.srcDir
    ? path.resolve(projectRoot, parsed.srcDir)
    : projectRoot === sourceRoot && vitepressDir.startsWith(sourceRoot)
      ? sourceRoot
      : projectRoot;

  const publicDir = (await pathExists(path.join(vitepressDir, "public")))
    ? path.join(vitepressDir, "public")
    : (await pathExists(path.join(projectRoot, "public")))
      ? path.join(projectRoot, "public")
      : null;

  return {
    sourceRoot,
    vitepressDir,
    contentDir,
    publicDir,
    configPath,
  };
}

async function findConfigFile(vitepressDir: string): Promise<string | null> {
  for (const name of ["config.ts", "config.js", "config.mjs", "config.mts"]) {
    const p = path.join(vitepressDir, name);
    if (await pathExists(p)) return p;
  }
  return null;
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function loadVitePressConfig(configPath: string): Promise<ParsedVitePressConfig> {
  const ext = path.extname(configPath);
  if (ext === ".js" || ext === ".mjs" || ext === ".mts") {
    try {
      const mod = (await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`)) as {
        default?: ParsedVitePressConfig;
      };
      return normalizeVitePressConfig(mod.default ?? (mod as unknown as ParsedVitePressConfig));
    } catch {
      // fall through to text extraction
    }
  }

  const source = await fs.readFile(configPath, "utf8");
  return extractConfigFromSource(source);
}

function normalizeVitePressConfig(raw: ParsedVitePressConfig): ParsedVitePressConfig {
  return {
    title: raw.title,
    description: raw.description,
    lang: raw.lang,
    base: raw.base,
    srcDir: raw.srcDir,
    cleanUrls: raw.cleanUrls,
    head: raw.head,
    themeConfig: raw.themeConfig,
    locales: raw.locales,
    markdown: raw.markdown,
    sitemap: raw.sitemap,
    rewrites: raw.rewrites,
  };
}

export function extractConfigFromSource(source: string): ParsedVitePressConfig {
  const config: ParsedVitePressConfig = {};

  config.title = extractStringProp(source, "title");
  config.description = extractStringProp(source, "description");
  config.lang = extractStringProp(source, "lang");
  config.base = extractStringProp(source, "base");
  config.srcDir = extractStringProp(source, "srcDir");

  const themeConfigLiteral = extractObjectLiteral(source, "themeConfig");
  if (themeConfigLiteral) {
    config.themeConfig = safeEvalObject(themeConfigLiteral) as ThemeConfig;
  }

  const localesLiteral = extractObjectLiteral(source, "locales");
  if (localesLiteral) {
    config.locales = safeEvalObject(localesLiteral) as ParsedVitePressConfig["locales"];
  }

  const headLiteral = extractObjectLiteral(source, "head");
  if (headLiteral) {
    config.head = safeEvalObject(headLiteral) as HeadTag[];
  }

  const sitemapLiteral = extractObjectLiteral(source, "sitemap");
  if (sitemapLiteral) {
    config.sitemap = safeEvalObject(sitemapLiteral) as ParsedVitePressConfig["sitemap"];
  }

  const markdownLiteral = extractObjectLiteral(source, "markdown");
  if (markdownLiteral) {
    config.markdown = safeEvalObject(markdownLiteral) as MarkdownConfig;
  }

  return config;
}

function extractStringProp(source: string, key: string): string | undefined {
  const re = new RegExp(`${key}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`);
  return source.match(re)?.[1];
}

function extractObjectLiteral(source: string, key: string): string | null {
  const marker = new RegExp(`${key}\\s*:\\s*`);
  const match = marker.exec(source);
  if (!match || match.index === undefined) return null;

  let i = match.index + match[0].length;
  while (i < source.length && /\s/.test(source[i] ?? "")) i++;

  const open = source[i];
  if (open !== "{" && open !== "[") return null;

  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let j = i; j < source.length; j++) {
    const ch = source[j];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === open) depth++;
    if (ch === close) {
      depth--;
      if (depth === 0) return source.slice(i, j + 1);
    }
  }
  return null;
}

function safeEvalObject(literal: string): unknown {
  try {
    // Migration CLI evaluates local project config snippets only.
    return Function(`"use strict"; return (${literal});`)();
  } catch {
    return undefined;
  }
}

export async function planVitePressMigration(options: MigrationOptions): Promise<MigrationPlan> {
  const sourceRoot = path.resolve(options.source);
  const layout = await resolveVitePressLayout(sourceRoot);
  if (!layout.configPath) {
    throw new Error(`No VitePress config found under ${sourceRoot}`);
  }

  const parsed = await loadVitePressConfig(layout.configPath);
  const warnings: MigrationWarning[] = [];
  const manualTasks: MigrationManualTask[] = [];
  const files: PlannedFile[] = [];

  const markdownPaths = await glob(["**/*.{md,mdx}"], {
    cwd: layout.contentDir,
    ignore: ["**/node_modules/**", "**/.vitepress/**", "**/dist/**"],
  });

  for (const rel of markdownPaths.sort()) {
    const sourcePath = path.join(layout.contentDir, rel);
    const raw = await fs.readFile(sourcePath, "utf8");
    const transformed = transformMarkdown(raw, rel, warnings, manualTasks);
    files.push({
      sourcePath,
      targetPath: rel,
      content: transformed.content,
      category: "markdown",
    });
  }

  if (layout.publicDir) {
    const assetPaths = await glob(["**/*"], {
      cwd: layout.publicDir,
      ignore: ["**/node_modules/**"],
      onlyFiles: true,
    });
    for (const rel of assetPaths.sort()) {
      const sourcePath = path.join(layout.publicDir, rel);
      const content = await fs.readFile(sourcePath);
      files.push({
        sourcePath,
        targetPath: path.join("public", rel),
        content: content.toString("base64"),
        category: "assets",
      });
    }
  }

  const componentDir = path.join(layout.vitepressDir, "theme");
  if (await pathExists(componentDir)) {
    await collectVueComponents(componentDir, layout.vitepressDir, warnings, manualTasks);
  }

  const configSnippet = generatePreactPressConfig(parsed, layout, manualTasks);
  const migrated = buildMigratedSummary(parsed, markdownPaths.length, layout);

  return { files, configSnippet, warnings, manualTasks, migrated };
}

function buildMigratedSummary(
  parsed: ParsedVitePressConfig,
  markdownCount: number,
  layout: VitePressProjectLayout,
) {
  const items = [];
  items.push({
    category: "markdown" as const,
    status: "migrated" as const,
    message: `${markdownCount} Markdown file(s) prepared`,
  });
  if (parsed.themeConfig?.nav?.length) {
    items.push({
      category: "navigation" as const,
      status: "migrated" as const,
      message: `${parsed.themeConfig.nav.length} nav item(s) mapped to themeConfig.nav`,
    });
  }
  if (parsed.themeConfig?.sidebar) {
    items.push({
      category: "sidebar" as const,
      status: "migrated" as const,
      message: "Sidebar configuration mapped to themeConfig.sidebar",
    });
  }
  if (parsed.locales) {
    items.push({
      category: "i18n" as const,
      status: "migrated" as const,
      message: `${Object.keys(parsed.locales).length} locale(s) mapped to locales config`,
    });
  }
  if (parsed.head?.length) {
    items.push({
      category: "head" as const,
      status: "migrated" as const,
      message: `${parsed.head.length} head tag(s) mapped`,
    });
  }
  if (parsed.sitemap?.hostname) {
    items.push({
      category: "sitemap" as const,
      status: "migrated" as const,
      message: `Sitemap hostname mapped to site.url (${parsed.sitemap.hostname})`,
    });
  }
  if (layout.publicDir) {
    items.push({
      category: "assets" as const,
      status: "migrated" as const,
      message: "Public assets scheduled for copy to public/",
    });
  }
  return items;
}

interface MarkdownTransformResult {
  content: string;
  extraFrontmatterItems: string[];
}

function transformMarkdown(
  raw: string,
  relPath: string,
  warnings: MigrationWarning[],
  manualTasks: MigrationManualTask[],
): MarkdownTransformResult {
  let content = raw;
  const extraFrontmatterItems: string[] = [];

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fmMatch) {
    content = transformFrontmatter(content, fmMatch[0], fmMatch[1], manualTasks);
  }

  content = transformLinks(content);
  content = transformCustomContainers(content);
  content = transformCodeGroups(content);

  scanVueUsage(content, relPath, warnings, manualTasks);

  if (VP_BADGE_RE.test(content)) {
    warnings.push({
      source: relPath,
      message: "VitePress <Badge /> component detected",
      hint: "Replace with plain text or a Preact component in MDX.",
    });
    manualTasks.push({
      category: "components",
      source: relPath,
      task: "Replace VitePress Badge components with Preact equivalents",
      hint: "Create a Preact Badge component and use it in .mdx pages.",
    });
  }

  if (VP_CUSTOM_BLOCK_RE.test(content)) {
    manualTasks.push({
      category: "markdown",
      source: relPath,
      task: "Replace VitePress snippet imports (<<< @/…)",
      hint: "Use PreactPress partial includes or copy snippet content inline.",
    });
  }

  return { content, extraFrontmatterItems };
}

function transformFrontmatter(
  content: string,
  block: string,
  fmBody: string,
  manualTasks: MigrationManualTask[],
): string {
  let nextBody = fmBody;

  if (FRONTMATTER_VUE_RE.test(fmBody)) {
    manualTasks.push({
      category: "frontmatter",
      task: "Review VitePress-specific frontmatter (layout, sidebar overrides)",
      hint: "Map layout to PreactPress page layouts and sidebar to route-level config if needed.",
    });
  }

  nextBody = nextBody.replace(/^editLink:\s*false\s*$/m, "editLink: false");
  nextBody = nextBody.replace(/^outline:\s*(true|false|\[\d,\s*\d+\])\s*$/m, "outline: $1");

  return content.replace(block, `---\n${nextBody.trimEnd()}\n---\n`);
}

function transformLinks(content: string): string {
  return content
    .replace(/\]\(\/([^)]+\.md)\)/g, "](/$1)")
    .replace(/\]\(\.\/([^)]+\.md)\)/g, "](./$1)")
    .replace(/\]\(([^)]+\.md)\)/g, (_, href: string) => {
      if (href.startsWith("http")) return `](${href})`;
      const withoutExt = href.replace(/\.mdx?$/, "");
      return `](${withoutExt})`;
    });
}

function transformCustomContainers(content: string): string {
  return content.replace(/^:::\s+(tip|info|warning|danger|caution|details)\b/gm, "::: $1");
}

function transformCodeGroups(content: string): string {
  if (/^:::\s*code-group\s*$/m.test(content)) {
    return content;
  }
  return content;
}

function scanVueUsage(
  content: string,
  relPath: string,
  warnings: MigrationWarning[],
  manualTasks: MigrationManualTask[],
): void {
  const vueComponents = new Set<string>();

  for (const match of content.matchAll(VUE_COMPONENT_RE)) {
    const name = match[1];
    if (["Details", "Badge", "CodeGroup"].includes(name)) continue;
    vueComponents.add(name);
  }

  if (SCRIPT_SETUP_RE.test(content) || IMPORT_VUE_RE.test(content) || VUE_DIRECTIVE_RE.test(content)) {
    warnings.push({
      source: relPath,
      message: "Vue-specific markdown syntax detected",
      hint: "Convert <script setup> blocks and Vue directives to Preact MDX components.",
    });
    manualTasks.push({
      category: "components",
      source: relPath,
      task: "Port Vue markdown blocks to Preact MDX",
      hint: "See https://preactjs.com/guide/v10/getting-started and rename .md to .mdx where needed.",
    });
  }

  for (const name of vueComponents) {
    warnings.push({
      source: relPath,
      message: `Vue component <${name} /> detected`,
      hint: "Port Vue SFCs to Preact function components (.tsx) and import them from MDX.",
    });
    manualTasks.push({
      category: "components",
      source: relPath,
      task: `Port Vue component "${name}" to Preact`,
      hint: "Replace ref/reactive with useState/useSignal, v-if with conditional JSX, v-for with .map().",
    });
  }
}

async function collectVueComponents(
  themeDir: string,
  vitepressDir: string,
  warnings: MigrationWarning[],
  manualTasks: MigrationManualTask[],
): Promise<void> {
  const vueFiles = await glob(["**/*.vue"], { cwd: themeDir, onlyFiles: true });
  for (const rel of vueFiles) {
    const source = path.join(themeDir, rel);
    warnings.push({
      source: path.relative(vitepressDir, source),
      message: `Vue component file "${rel}" requires manual porting`,
      hint: "Create an equivalent Preact component under components/ and update theme registration.",
    });
    manualTasks.push({
      category: "components",
      source: rel,
      task: `Port Vue theme component "${rel}" to Preact`,
      hint: "Move logic to components/*.tsx and register via a custom theme layout.",
    });
  }
}

function generatePreactPressConfig(
  parsed: ParsedVitePressConfig,
  layout: VitePressProjectLayout,
  manualTasks: MigrationManualTask[],
): string {
  const userConfig: UserConfig = {
    srcExclude: ["README.md", "partials/**", "parts/**"],
    site: {
      title: parsed.title ?? "Migrated Site",
      description: parsed.description ?? "",
      url: parsed.sitemap?.hostname,
      base: parsed.base,
      lang: parsed.lang,
    },
    markdown: {
      html: parsed.markdown?.html ?? false,
      linkify: parsed.markdown?.linkify,
      typographer: parsed.markdown?.typographer,
      emoji: true,
      math: Boolean(parsed.markdown?.math),
    },
    head: parsed.head,
    themeConfig: parsed.themeConfig ?? {},
    build: {
      sitemap: Boolean(parsed.sitemap?.hostname ?? true),
      robots: true,
    },
  };

  if (parsed.locales) {
    userConfig.locales = parsed.locales;
  }

  manualTasks.push({
    category: "theme-config",
    task: "Review generated .preactpress/config.ts for nav, sidebar, and search settings",
    hint: "Algolia DocSearch options may need plugin setup in PreactPress.",
  });

  if (layout.vitepressDir.includes("theme")) {
    manualTasks.push({
      category: "theme-config",
      task: "Replace VitePress custom theme with a PreactPress custom theme layout",
    });
  }

  return `import { defineConfig } from "@kamod-ch/preactpress/config";

// Generated by: preactpress migrate vitepress
// Review nav, sidebar, locales, and head tags before production use.

export default defineConfig(${serializeConfig(userConfig, 1)});
`;
}

function serializeConfig(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);

  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((item) => `${padIn}${serializeConfig(item, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    );
    if (entries.length === 0) return "{}";
    const lines = entries.map(
      ([key, v]) => `${padIn}${/^[\w$]+$/.test(key) ? key : JSON.stringify(key)}: ${serializeConfig(v, indent + 1)}`,
    );
    return `{\n${lines.join(",\n")},\n${pad}}`;
  }

  return JSON.stringify(value);
}

export function transformAssetContent(content: string): Buffer {
  return Buffer.from(content, "base64");
}

export function isAssetFile(file: PlannedFile): boolean {
  return file.category === "assets";
}

export type { NavItem, SidebarGroup };
