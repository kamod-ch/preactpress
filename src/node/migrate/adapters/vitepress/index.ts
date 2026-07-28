import type { MigrationAdapter, MigrationOptions, MigrationPlan } from "../../types.js";
import {
  detectVitePressProject,
  planVitePressMigration,
} from "./analyze.js";

export const vitepressAdapter: MigrationAdapter = {
  id: "vitepress",
  label: "VitePress",

  async detect(sourceRoot: string): Promise<boolean> {
    return detectVitePressProject(sourceRoot);
  },

  async plan(options: MigrationOptions): Promise<MigrationPlan> {
    return planVitePressMigration(options);
  },
};
