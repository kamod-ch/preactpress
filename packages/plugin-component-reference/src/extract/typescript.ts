import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { ComponentEntry, ComponentProp, ComponentSourceLink } from "../types/index.js";

export interface ExtractComponentOptions {
  root: string;
  source: string;
  exportName: string;
  tsconfig?: string;
  gitRemote?: string;
  gitBranch?: string;
}

function readTsconfig(root: string, tsconfigPath?: string): ts.ParsedCommandLine {
  const configFile = tsconfigPath
    ? path.resolve(root, tsconfigPath)
    : ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
  if (!configFile) {
    throw new Error(`componentReference: tsconfig not found under ${root}`);
  }
  const config = ts.readConfigFile(configFile, ts.sys.readFile);
  if (config.error) {
    throw new Error(ts.formatDiagnostic(config.error, formatHost()));
  }
  return ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configFile));
}

function formatHost(): ts.FormatDiagnosticsHost {
  return {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => "\n",
  };
}

function jsDocText(symbol: ts.Symbol, tagName?: string): string | undefined {
  const comments = symbol.getJsDocTags?.() ?? [];
  if (tagName) {
    const tag = comments.find((entry) => entry.name === tagName);
    if (!tag?.text) return undefined;
    return (
      tag.text
        .map((part) => part.text)
        .join("")
        .trim() || undefined
    );
  }
  const docs = symbol.getDocumentationComment(undefined);
  const text = ts.displayPartsToString(docs).trim();
  return text || undefined;
}

function propDefault(symbol: ts.Symbol): string | undefined {
  return jsDocText(symbol, "default");
}

function typeText(checker: ts.TypeChecker, type: ts.Type): string {
  const str = checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation);
  return str.replace(/\s+/g, " ").trim();
}

function collectProps(
  checker: ts.TypeChecker,
  type: ts.Type,
  inheritedFrom?: string,
  seen = new Set<string>(),
): ComponentProp[] {
  const props: ComponentProp[] = [];

  if (type.isUnion()) {
    for (const member of type.types) {
      props.push(...collectProps(checker, member, inheritedFrom, seen));
    }
    return dedupeProps(props);
  }

  if (type.isIntersection()) {
    for (const member of type.types) {
      const symbol = member.getSymbol();
      const name = symbol?.getName();
      const nextInherited =
        name && !["__type", "IntrinsicAttributes"].includes(name) ? name : inheritedFrom;
      props.push(...collectProps(checker, member, nextInherited, seen));
    }
    return dedupeProps(props);
  }

  for (const prop of type.getProperties()) {
    if (prop.name.startsWith("__")) continue;
    if (seen.has(prop.name)) continue;
    seen.add(prop.name);

    const declaration = prop.valueDeclaration ?? prop.declarations?.[0];
    if (!declaration) continue;
    const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);

    props.push({
      name: prop.name,
      type: typeText(checker, propType),
      required:
        !(prop.flags & ts.SymbolFlags.Optional) &&
        !("questionToken" in declaration && declaration.questionToken),
      defaultValue: propDefault(prop),
      description: jsDocText(prop),
      deprecated: jsDocText(prop, "deprecated"),
      inheritedFrom: inheritedFrom,
    });
  }

  return dedupeProps(props);
}

function dedupeProps(props: ComponentProp[]): ComponentProp[] {
  const map = new Map<string, ComponentProp>();
  for (const prop of props) {
    const existing = map.get(prop.name);
    if (!existing) {
      map.set(prop.name, prop);
      continue;
    }
    map.set(prop.name, {
      ...existing,
      type: existing.type === prop.type ? existing.type : `${existing.type} | ${prop.type}`,
      required: existing.required && prop.required,
      description: existing.description ?? prop.description,
      deprecated: existing.deprecated ?? prop.deprecated,
      defaultValue: existing.defaultValue ?? prop.defaultValue,
      inheritedFrom: existing.inheritedFrom ?? prop.inheritedFrom,
    });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function findExport(sourceFile: ts.SourceFile, exportName: string): ts.Node | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      const isExport = statement.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExport) continue;
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === exportName) return decl;
      }
    }
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === exportName) {
      const isExport = statement.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword);
      if (isExport) return statement;
    }
  }
  return undefined;
}

function propsTypeFromParameter(
  checker: ts.TypeChecker,
  param: ts.ParameterDeclaration,
): ts.Type | undefined {
  if (param.type) {
    return checker.getTypeFromTypeNode(param.type);
  }

  const paramSymbol = checker.getSymbolAtLocation(param.name);
  if (paramSymbol) {
    const symbolType = checker.getTypeOfSymbolAtLocation(paramSymbol, param);
    if (symbolType.getCallSignatures().length === 0 && symbolType.getProperties().length > 0) {
      return symbolType;
    }
  }

  const locationType = checker.getTypeAtLocation(param);
  if (locationType.getProperties().length > 0) {
    return locationType;
  }

  return undefined;
}

function propsTypeFromCallSignature(checker: ts.TypeChecker, node: ts.Node): ts.Type | undefined {
  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) return undefined;
  const type = checker.getTypeOfSymbolAtLocation(symbol, node);
  const callSignatures = type.getCallSignatures();
  if (!callSignatures[0]) return undefined;

  const paramDecl = callSignatures[0].declaration?.parameters[0];
  if (paramDecl && ts.isParameter(paramDecl)) {
    const fromParam = propsTypeFromParameter(checker, paramDecl);
    if (fromParam) return fromParam;
  }

  const paramSymbol = callSignatures[0].parameters[0];
  if (paramSymbol?.valueDeclaration && ts.isParameter(paramSymbol.valueDeclaration)) {
    return propsTypeFromParameter(checker, paramSymbol.valueDeclaration);
  }
  if (paramSymbol?.valueDeclaration) {
    return checker.getTypeOfSymbolAtLocation(paramSymbol, paramSymbol.valueDeclaration);
  }

  return undefined;
}

function propsTypeFromExport(checker: ts.TypeChecker, node: ts.Node): ts.Type | undefined {
  if (ts.isFunctionDeclaration(node) && node.parameters[0]) {
    const fromParam = propsTypeFromParameter(checker, node.parameters[0]);
    if (fromParam) return fromParam;
    return propsTypeFromCallSignature(checker, node);
  }

  if (ts.isVariableDeclaration(node) && node.initializer) {
    if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
      const param = node.initializer.parameters[0];
      if (param) {
        const fromParam = propsTypeFromParameter(checker, param);
        if (fromParam) return fromParam;
      }
    }
    return propsTypeFromCallSignature(checker, node);
  }

  return propsTypeFromCallSignature(checker, node);
}

function sourceLinkForNode(
  root: string,
  node: ts.Node,
  gitRemote?: string,
  gitBranch = "main",
): ComponentSourceLink | undefined {
  const sourceFile = node.getSourceFile();
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  const file = path.relative(root, sourceFile.fileName);
  const link: ComponentSourceLink = { file, line };
  if (gitRemote) {
    link.url = `${gitRemote.replace(/\/$/, "")}/blob/${gitBranch}/${file.replace(/\\/g, "/")}#L${line}`;
  }
  return link;
}

/** Statically extract component props without executing application code. */
export function extractComponentEntry(options: ExtractComponentOptions): ComponentEntry {
  const absSource = path.resolve(options.root, options.source);
  if (!fs.existsSync(absSource)) {
    throw new Error(`componentReference: source file not found: ${options.source}`);
  }

  const parsed = readTsconfig(options.root, options.tsconfig);
  const program = ts.createProgram([absSource, ...parsed.fileNames], parsed.options);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(absSource);
  if (!sourceFile) {
    throw new Error(`componentReference: failed to load ${options.source}`);
  }

  const exportNode = findExport(sourceFile, options.exportName);
  if (!exportNode) {
    throw new Error(
      `componentReference: export "${options.exportName}" not found in ${options.source}`,
    );
  }

  const symbol = checker.getSymbolAtLocation(exportNode);
  const propsType = propsTypeFromExport(checker, exportNode);
  if (!propsType) {
    throw new Error(`componentReference: could not resolve props type for "${options.exportName}"`);
  }

  const props = collectProps(checker, propsType);
  const examples = symbol ? jsDocText(symbol, "example") : undefined;

  return {
    name: options.exportName,
    exportName: options.exportName,
    description: symbol ? jsDocText(symbol) : undefined,
    props,
    examples: examples ? [examples] : undefined,
    source: sourceLinkForNode(options.root, exportNode, options.gitRemote, options.gitBranch),
    tags: ["component", options.exportName, ...props.map((prop) => prop.name)],
  };
}
