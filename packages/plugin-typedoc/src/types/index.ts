/** Stable manifest schema version. */
export const API_MANIFEST_VERSION = 1 as const;

export type ApiSymbolKind =
  | "module"
  | "namespace"
  | "class"
  | "interface"
  | "type-alias"
  | "enum"
  | "function"
  | "variable"
  | "property"
  | "method"
  | "constructor"
  | "parameter"
  | "accessor"
  | "enum-member";

export interface ApiSourceLink {
  file: string;
  line: number;
  url?: string;
}

export interface ApiTypeRef {
  text: string;
  slug?: string;
}

export interface ApiTypeParameter {
  name: string;
  constraint?: ApiTypeRef;
  default?: ApiTypeRef;
  description?: string;
}

export interface ApiParameter {
  name: string;
  type: ApiTypeRef;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
}

export interface ApiSignature {
  name: string;
  parameters: ApiParameter[];
  returnType?: ApiTypeRef;
  typeParameters?: ApiTypeParameter[];
  description?: string;
}

export interface ApiEnumMember {
  name: string;
  value?: string;
  description?: string;
}

export interface ApiSymbolFlags {
  isPrivate?: boolean;
  isProtected?: boolean;
  isStatic?: boolean;
  isReadonly?: boolean;
  isOptional?: boolean;
}

/** Canonical structured symbol record used by renderers and future API sources. */
export interface ApiSymbol {
  id: string;
  kind: ApiSymbolKind;
  name: string;
  qualifiedName: string;
  slug: string;
  route: string;
  module?: string;
  description?: string;
  deprecated?: string;
  since?: string;
  examples?: string[];
  source?: ApiSourceLink;
  signatures?: ApiSignature[];
  members?: string[];
  parent?: string;
  type?: ApiTypeRef;
  enumMembers?: ApiEnumMember[];
  flags?: ApiSymbolFlags;
  group?: string;
  tags?: string[];
}

export interface ApiTreeNode {
  id: string;
  text: string;
  link?: string;
  items?: ApiTreeNode[];
}

/** Structured API manifest decoupled from TypeDoc internals. */
export interface ApiManifest {
  version: typeof API_MANIFEST_VERSION;
  generatedAt: string;
  sourceHash: string;
  baseRoute: string;
  outputDir: string;
  symbols: Record<string, ApiSymbol>;
  modules: string[];
  tree: ApiTreeNode[];
}

export interface ApiPage {
  route: string;
  relativePath: string;
  markdown: string;
  title: string;
  description?: string;
  tags: string[];
}

export interface ApiGenerationResult {
  manifest: ApiManifest;
  pages: ApiPage[];
}
