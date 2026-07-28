export const COMPONENT_MANIFEST_VERSION = 1 as const;

export interface ComponentSourceLink {
  file: string;
  line: number;
  url?: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  deprecated?: string;
  inheritedFrom?: string;
}

export interface ComponentEntry {
  name: string;
  exportName: string;
  description?: string;
  props: ComponentProp[];
  examples?: string[];
  source?: ComponentSourceLink;
  subcomponents?: string[];
  tags: string[];
}

/** Structured component reference data reusable by renderers and search. */
export interface ComponentManifest {
  version: typeof COMPONENT_MANIFEST_VERSION;
  generatedAt: string;
  sourceHash: string;
  components: Record<string, ComponentEntry>;
}

export interface ComponentLookup {
  component?: string;
  source?: string;
  exportName?: string;
}
