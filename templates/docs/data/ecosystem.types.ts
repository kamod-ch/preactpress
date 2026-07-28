export interface EcosystemItem {
  name: string;
  package: string;
  type: "plugin" | "theme" | "starter";
  description: string;
  repository: string;
  documentation?: string;
  author: string;
  official: boolean;
  tags: string[];
}

/** Registry entries include a compatible PreactPress version range. */
export interface EcosystemRegistryItem extends EcosystemItem {
  preactpressVersion: string;
}

export type EcosystemTypeFilter = "all" | EcosystemItem["type"];
