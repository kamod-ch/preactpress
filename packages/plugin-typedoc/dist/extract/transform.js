import path from "node:path";
import { Application, ReflectionKind } from "typedoc";
import { API_MANIFEST_VERSION } from "../types/index.js";
import { joinRoute, slugifySegment, symbolId } from "../render/slugs.js";
const PAGE_KINDS = new Set([
  "module",
  "namespace",
  "class",
  "interface",
  "type-alias",
  "enum",
  "function",
  "variable",
]);
function kindName(kind) {
  if (kind & ReflectionKind.Module) return "module";
  if (kind & ReflectionKind.Namespace) return "namespace";
  if (kind & ReflectionKind.Class) return "class";
  if (kind & ReflectionKind.Interface) return "interface";
  if (kind & ReflectionKind.TypeAlias) return "type-alias";
  if (kind & ReflectionKind.Enum) return "enum";
  if (kind & ReflectionKind.EnumMember) return "enum-member";
  if (kind & ReflectionKind.Function) return "function";
  if (kind & ReflectionKind.Variable) return "variable";
  if (kind & ReflectionKind.Property) return "property";
  if (kind & ReflectionKind.Method) return "method";
  if (kind & ReflectionKind.Constructor) return "constructor";
  if (kind & ReflectionKind.Parameter) return "parameter";
  if (kind & ReflectionKind.Accessor) return "accessor";
  return undefined;
}
function commentText(reflection, tag) {
  const comment = reflection.comment;
  if (!comment) return undefined;
  if (tag) {
    const bare = tag.replace(/^@/, "");
    const block = comment.blockTags?.find((entry) => entry.tag.replace(/^@/, "") === bare);
    const text = block?.content
      ?.map((part) => part.text)
      .join("")
      .trim();
    return text || undefined;
  }
  const text = comment.summary
    ?.map((part) => part.text)
    .join("")
    .trim();
  return text || undefined;
}
function examplesFrom(reflection) {
  const tags =
    reflection.comment?.blockTags?.filter((entry) => entry.tag.replace(/^@/, "") === "example") ??
    [];
  if (!tags.length) return undefined;
  return tags
    .map((tag) =>
      tag.content
        ?.map((part) => part.text)
        .join("")
        .trim(),
    )
    .filter((value) => Boolean(value));
}
function sourceFrom(reflection, ctx) {
  const decl = reflection;
  const source = decl.sources?.[0];
  if (!source) return undefined;
  const file = path.relative(ctx.root, source.fullFileName);
  const link = { file, line: source.line };
  if (ctx.sourceLinks && ctx.gitRemote) {
    const branch = ctx.gitBranch ?? "main";
    link.url = `${ctx.gitRemote.replace(/\/$/, "")}/blob/${branch}/${file.replace(/\\/g, "/")}#L${source.line}`;
  }
  return link;
}
function typeRef(type, ctx) {
  if (!type) return undefined;
  return { text: ctx.typeToString(type) };
}
function typeParametersFrom(params, ctx) {
  if (!params?.length) return undefined;
  return params.map((param) => ({
    name: param.name,
    constraint: typeRef(param.type, ctx),
    default: typeRef(param.default, ctx),
    description: commentText(param),
  }));
}
function parametersFrom(params, ctx) {
  return (params ?? []).map((param) => ({
    name: param.name,
    type: typeRef(param.type, ctx) ?? { text: "unknown" },
    description: commentText(param),
    optional: param.flags.isOptional,
    defaultValue: param.defaultValue,
  }));
}
function signaturesFrom(reflection, ctx) {
  const signatures = reflection.signatures ?? [];
  if (!signatures.length) return undefined;
  return signatures.map((signature) => ({
    name: signature.name,
    parameters: parametersFrom(signature.parameters, ctx),
    returnType: typeRef(signature.type, ctx),
    typeParameters: typeParametersFrom(signature.typeParameters, ctx),
    description: commentText(signature),
  }));
}
function shouldInclude(reflection, ctx) {
  if (!ctx.includePrivate && reflection.flags.isPrivate) return false;
  if (reflection.flags.isExternal) return false;
  return true;
}
function moduleRoutePrefix(reflection) {
  const segments = [];
  let current = reflection.parent ?? undefined;
  while (current && !(current.kind & ReflectionKind.Project)) {
    if (current.kind & ReflectionKind.Module || current.kind & ReflectionKind.Namespace) {
      segments.unshift(current.name);
    }
    current = current.parent ?? undefined;
  }
  return segments.map(slugifySegment);
}
function createSymbolRecord(reflection, ctx, parent) {
  if (!shouldInclude(reflection, ctx)) return undefined;
  const kind = kindName(reflection.kind);
  if (!kind || kind === "parameter" || kind === "enum-member") return undefined;
  const moduleSegments = moduleRoutePrefix(reflection);
  const pageKind = PAGE_KINDS.has(kind);
  const slugParts = pageKind ? [...moduleSegments, reflection.name] : [];
  const route = pageKind
    ? joinRoute(ctx.baseRoute, ...slugParts)
    : (parent?.route ?? joinRoute(ctx.baseRoute));
  const qualifiedName = reflection.getFriendlyFullName();
  const symbol = {
    id: symbolId(qualifiedName),
    kind,
    name: reflection.name,
    qualifiedName,
    slug: slugParts.map(slugifySegment).join("/") || slugifySegment(reflection.name),
    route,
    module: moduleSegments.join("."),
    description: commentText(reflection) ?? signaturesFrom(reflection, ctx)?.[0]?.description,
    deprecated: commentText(reflection, "@deprecated"),
    since: commentText(reflection, "@since"),
    examples:
      examplesFrom(reflection) ??
      reflection.signatures?.flatMap((signature) => examplesFrom(signature) ?? []) ??
      undefined,
    source: sourceFrom(reflection, ctx),
    signatures: signaturesFrom(reflection, ctx),
    type: typeRef(reflection.type, ctx),
    parent: parent?.id,
    flags: {
      isPrivate: reflection.flags.isPrivate || undefined,
      isProtected: reflection.flags.isProtected || undefined,
      isStatic: reflection.flags.isStatic || undefined,
      isReadonly: reflection.flags.isReadonly || undefined,
      isOptional: reflection.flags.isOptional || undefined,
    },
    group: ctx.groupBy === "kind" ? kind : (moduleSegments[0] ?? "root"),
    tags: ["api", kind],
  };
  if (kind === "enum") {
    symbol.enumMembers = (reflection.children ?? [])
      .filter((child) => child.kind & ReflectionKind.EnumMember)
      .map((member) => ({
        name: member.name,
        value: String(member.defaultValue ?? member.name),
        description: commentText(member),
      }));
  }
  return symbol;
}
function walkDeclaration(reflection, ctx, manifest, parent) {
  if (!shouldInclude(reflection, ctx)) return;
  const symbol = createSymbolRecord(reflection, ctx, parent);
  const pageContainer = symbol && PAGE_KINDS.has(symbol.kind) ? symbol : parent;
  if (symbol && PAGE_KINDS.has(symbol.kind)) {
    manifest.symbols[symbol.id] = symbol;
    if (symbol.kind === "module") manifest.modules.push(symbol.id);
  }
  if (pageContainer) {
    const memberChildren = (reflection.children ?? []).filter((child) => {
      const childKind = kindName(child.kind);
      return childKind && !PAGE_KINDS.has(childKind);
    });
    if (memberChildren.length) {
      pageContainer.members = pageContainer.members ?? [];
      for (const child of memberChildren) {
        const member = createSymbolRecord(child, ctx, pageContainer);
        if (!member) continue;
        manifest.symbols[member.id] = member;
        pageContainer.members.push(member.id);
      }
    }
  }
  for (const child of reflection.children ?? []) {
    if (child.kind & ReflectionKind.EnumMember) continue;
    const childKind = kindName(child.kind);
    if (childKind && PAGE_KINDS.has(childKind)) {
      walkDeclaration(child, ctx, manifest, pageContainer);
    }
  }
}
function buildTree(manifest) {
  const moduleSymbols = manifest.modules
    .map((id) => manifest.symbols[id])
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
  const nodes = moduleSymbols.map((module) => ({
    id: module.id,
    text: module.name,
    link: module.route,
    items: Object.values(manifest.symbols)
      .filter(
        (symbol) =>
          symbol.id !== module.id &&
          PAGE_KINDS.has(symbol.kind) &&
          symbol.module?.startsWith(module.name),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((symbol) => ({ id: symbol.id, text: symbol.name, link: symbol.route })),
  }));
  const topLevel = Object.values(manifest.symbols)
    .filter((symbol) => PAGE_KINDS.has(symbol.kind) && symbol.kind !== "module" && !symbol.module)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (topLevel.length) {
    nodes.push({
      id: "exports",
      text: "Exports",
      items: topLevel.map((symbol) => ({ id: symbol.id, text: symbol.name, link: symbol.route })),
    });
  }
  return nodes;
}
export function projectToManifest(project, ctx) {
  const manifest = {
    version: API_MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    sourceHash: ctx.sourceHash,
    baseRoute: ctx.baseRoute,
    outputDir: ctx.outputDir,
    symbols: {},
    modules: [],
    tree: [],
  };
  for (const child of project.children ?? []) {
    walkDeclaration(child, ctx, manifest);
  }
  manifest.tree = buildTree(manifest);
  return manifest;
}
export async function convertTypeDocProject(options) {
  const entryPoints = options.entries.map((entry) => path.resolve(options.root, entry));
  const app = await Application.bootstrap({
    entryPoints,
    tsconfig: options.tsconfig,
    excludePrivate: !options.includePrivate,
    excludeInternal: true,
    skipErrorChecking: true,
    readme: "none",
    disableSources: false,
  });
  const project = await app.convert();
  if (!project) {
    throw new Error(
      "typedocPlugin: TypeDoc failed to convert the project. Check entry points and tsconfig.",
    );
  }
  const ctx = {
    root: options.root,
    baseRoute: options.baseRoute,
    outputDir: options.outputDir,
    sourceHash: options.sourceHash,
    includePrivate: options.includePrivate,
    sourceLinks: options.sourceLinks,
    gitRemote: options.gitRemote,
    gitBranch: options.gitBranch,
    groupBy: options.groupBy,
    typeToString: (type) => (type ? type.toString() : "void"),
  };
  return projectToManifest(project, ctx);
}
//# sourceMappingURL=transform.js.map
