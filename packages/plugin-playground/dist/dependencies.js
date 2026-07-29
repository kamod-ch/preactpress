const DEFAULT_ALLOWLIST = [
  "preact",
  "preact/hooks",
  "preact/jsx-runtime",
  "preact/compat",
  "@preact/signals",
  "@preact/signals-core",
];
const DEFAULT_CDN = "https://esm.sh";
/** Built-in CDN URLs for core Preact packages. */
const CORE_IMPORTS = {
  preact: "https://esm.sh/preact@10.29.2",
  "preact/hooks": "https://esm.sh/preact@10.29.2/hooks",
  "preact/jsx-runtime": "https://esm.sh/preact@10.29.2/jsx-runtime",
  "preact/compat": "https://esm.sh/preact@10.29.2/compat",
  "@preact/signals": "https://esm.sh/@preact/signals@2.3.2",
  "@preact/signals-core": "https://esm.sh/@preact/signals-core@1.12.1",
};
/** Build dependency resolution context from plugin options. */
export function createDependencyContext(options = {}) {
  return {
    allowlist: new Set(options.dependencyAllowlist ?? DEFAULT_ALLOWLIST),
    cdnBase: options.esmCdnBase?.replace(/\/$/, "") ?? DEFAULT_CDN,
    workspacePackages: options.workspacePackages ?? {},
  };
}
/** Resolve user-declared dependencies into an import map for the sandbox iframe. */
export function resolveImportMap(dependencies, context) {
  const imports = { ...CORE_IMPORTS };
  const errors = [];
  for (const [name, specifier] of Object.entries(dependencies)) {
    const resolved = resolveDependency(name, specifier, context);
    if ("error" in resolved) {
      errors.push(resolved.error);
      continue;
    }
    imports[name] = resolved.url;
  }
  return { imports, errors };
}
function resolveDependency(name, specifier, context) {
  if (specifier === "workspace") {
    const mapped = context.workspacePackages[name];
    if (!mapped) {
      return {
        error: `Dependency "${name}" uses workspace specifier but no workspacePackages mapping was configured.`,
      };
    }
    return { url: mapped };
  }
  if (specifier.startsWith("https://") || specifier.startsWith("http://")) {
    if (!context.allowlist.has(name)) {
      return { error: `Dependency "${name}" is not in the playground allowlist.` };
    }
    return { url: specifier };
  }
  if (!context.allowlist.has(name)) {
    return { error: `Dependency "${name}" is not in the playground allowlist.` };
  }
  if (CORE_IMPORTS[name] && (specifier === "latest" || specifier === "*")) {
    return { url: CORE_IMPORTS[name] };
  }
  return { url: `${context.cdnBase}/${name}@${specifier}` };
}
/** Validate that imports in source only reference allowed packages or virtual files. */
export function findDisallowedImports(source, virtualPaths, context) {
  const importRe = /(?:import|export)\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g;
  const violations = [];
  let match;
  while ((match = importRe.exec(source)) !== null) {
    const specifier = match[1];
    if (!specifier || specifier.startsWith(".") || specifier.startsWith("/")) {
      if (specifier?.startsWith("/") && !virtualPaths.has(specifier)) {
        violations.push(`Unknown virtual file import: ${specifier}`);
      }
      continue;
    }
    const root = packageRoot(specifier);
    if (!context.allowlist.has(root) && !context.workspacePackages[root]) {
      violations.push(`Import "${specifier}" is not allowed in the playground.`);
    }
  }
  return violations;
}
function packageRoot(specifier) {
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }
  return specifier.split("/")[0] ?? specifier;
}
//# sourceMappingURL=dependencies.js.map
