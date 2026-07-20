import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PACKAGE_ROOT } from "./packageRoot.js";

export interface InitResult {
  root: string;
  preactpressVersion: string;
  template: InitTemplateName;
}

export const INIT_TEMPLATES = [
  "default",
  "docs",
  "magazine",
  "hono",
  "blog",
  "product-docs",
  "api-docs",
  "saas-docs",
  "knowledge-base",
] as const;
export type InitTemplateName = (typeof INIT_TEMPLATES)[number];

export interface InitOptions {
  template?: string;
}

const SKIP_TEMPLATE_ENTRIES = new Set(["dist", "node_modules", "pnpm-lock.yaml"]);
const TEMPLATE_DIRS: Record<InitTemplateName, string> = {
  default: path.join("templates", "default"),
  docs: path.join("templates", "docs"),
  magazine: path.join("templates", "magazine"),
  hono: path.join("templates", "hono"),
  blog: path.join("templates", "blog"),
  "product-docs": path.join("templates", "product-docs"),
  "api-docs": path.join("templates", "api-docs"),
  "saas-docs": path.join("templates", "saas-docs"),
  "knowledge-base": path.join("templates", "knowledge-base"),
};

function shouldCopyTemplateEntry(rel: string): boolean {
  if (!rel) return true;
  const top = rel.split(path.sep)[0];
  if (SKIP_TEMPLATE_ENTRIES.has(top) || SKIP_TEMPLATE_ENTRIES.has(rel)) return false;
  return true;
}

function packageInstallPath(nodeModules: string, packageName: string): string {
  if (packageName.startsWith("@")) {
    const [scope, name] = packageName.split("/");
    return path.join(nodeModules, scope, name);
  }
  return path.join(nodeModules, packageName);
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readPreactpressPackage(): Promise<{ name: string; version: string }> {
  const pkgPath = path.join(PACKAGE_ROOT, "package.json");
  const raw = await fs.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(raw) as { name?: string; version?: string };
  if (!pkg.name) throw new Error("preactpress: missing name in package.json");
  if (!pkg.version) throw new Error("preactpress: missing version in package.json");
  return { name: pkg.name, version: pkg.version };
}

async function linkPackage(targetRoot: string, packageName: string, target: string): Promise<void> {
  const nodeModules = path.join(targetRoot, "node_modules");
  const linkPath = packageInstallPath(nodeModules, packageName);
  const resolvedTarget = path.resolve(target);
  await fs.mkdir(path.dirname(linkPath), { recursive: true });
  try {
    const existing = await fs.readlink(linkPath);
    if (path.resolve(path.dirname(linkPath), existing) === resolvedTarget) return;
    await fs.rm(linkPath, { recursive: true, force: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT" && code !== "EINVAL" && code !== "ELOOP") throw err;
    try {
      await fs.rm(linkPath, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
  await fs.symlink(resolvedTarget, linkPath, "dir");
}

async function linkLocalPreactpress(targetRoot: string, packageName: string): Promise<void> {
  await linkPackage(targetRoot, packageName, PACKAGE_ROOT);
}

/** Ensure a local `file:` devDependency is linked when node_modules is missing (bundled templates). */
export async function ensurePreactpressLinked(siteRoot: string): Promise<void> {
  const pkgPath = path.join(siteRoot, "package.json");
  if (!(await fileExists(pkgPath))) return;

  const { name: packageName } = await readPreactpressPackage();
  const raw = await fs.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(raw) as {
    devDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
  };
  const spec = pkg.devDependencies?.[packageName] ?? pkg.dependencies?.[packageName];
  if (!spec?.startsWith("file:")) return;

  const linkPath = packageInstallPath(path.join(siteRoot, "node_modules"), packageName);
  if (await fileExists(path.join(linkPath, "package.json"))) return;

  const target = path.resolve(siteRoot, spec.slice("file:".length));
  if (!(await fileExists(path.join(target, "package.json")))) return;
  await linkPackage(siteRoot, packageName, target);
}

async function patchStarterPackageJson(
  targetRoot: string,
  packageName: string,
  preactpressVersion: string,
): Promise<void> {
  const pkgPath = path.join(targetRoot, "package.json");
  const raw = await fs.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(raw) as {
    devDependencies?: Record<string, string>;
  };
  pkg.devDependencies = pkg.devDependencies ?? {};
  delete pkg.devDependencies.preactpress;
  pkg.devDependencies[packageName] = `^${preactpressVersion}`;
  await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function resolveTemplateName(template: string | undefined): InitTemplateName {
  const name = template ?? "default";
  if (INIT_TEMPLATES.includes(name as InitTemplateName)) return name as InitTemplateName;
  throw new Error(
    `unknown init template "${name}". Available templates: ${INIT_TEMPLATES.join(", ")}`,
  );
}

export async function init(targetRoot: string, options: InitOptions = {}): Promise<InitResult> {
  const template = resolveTemplateName(options.template);
  const here = path.dirname(fileURLToPath(import.meta.url));
  const templateDir = path.resolve(here, "../..", TEMPLATE_DIRS[template]);
  const resolvedRoot = path.resolve(targetRoot);

  await fs.cp(templateDir, resolvedRoot, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(templateDir, src);
      return shouldCopyTemplateEntry(rel);
    },
  });

  const { name: packageName, version: preactpressVersion } = await readPreactpressPackage();
  await patchStarterPackageJson(resolvedRoot, packageName, preactpressVersion);
  await linkLocalPreactpress(resolvedRoot, packageName);

  return { root: resolvedRoot, preactpressVersion, template };
}
