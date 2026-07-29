export type MigrationCategory =
  | "markdown"
  | "frontmatter"
  | "navigation"
  | "sidebar"
  | "theme-config"
  | "code-groups"
  | "containers"
  | "links"
  | "assets"
  | "components"
  | "head"
  | "sitemap"
  | "i18n"
  | "config";

export type MigrationItemStatus = "migrated" | "skipped" | "manual" | "warning";

export interface MigrationItem {
  category: MigrationCategory;
  status: MigrationItemStatus;
  source?: string;
  target?: string;
  message: string;
}

export interface MigrationWarning {
  source: string;
  message: string;
  hint?: string;
}

export interface MigrationManualTask {
  category: MigrationCategory;
  source?: string;
  task: string;
  hint?: string;
}

export interface MigrationReport {
  adapter: string;
  sourceRoot: string;
  outputRoot: string;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  migrated: MigrationItem[];
  warnings: MigrationWarning[];
  manualTasks: MigrationManualTask[];
  stats: {
    filesWritten: number;
    filesSkipped: number;
    markdownFiles: number;
    assetFiles: number;
    vueComponents: number;
  };
}

export interface MigrationOptions {
  source: string;
  output: string;
  dryRun: boolean;
}

export interface MigrationPlan {
  files: PlannedFile[];
  configSnippet?: string;
  warnings: MigrationWarning[];
  manualTasks: MigrationManualTask[];
  migrated: MigrationItem[];
}

export interface PlannedFile {
  sourcePath: string;
  targetPath: string;
  content: string;
  category: MigrationCategory;
}

export interface MigrationAdapter {
  readonly id: string;
  readonly label: string;
  detect(sourceRoot: string): Promise<boolean>;
  plan(options: MigrationOptions): Promise<MigrationPlan>;
}
