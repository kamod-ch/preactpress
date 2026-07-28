import type { MigrationAdapter } from "../types.js";
import { vitepressAdapter } from "./vitepress/index.js";

const ADAPTERS: Record<string, MigrationAdapter> = {
  vitepress: vitepressAdapter,
};

export function getMigrationAdapter(id: string): MigrationAdapter | undefined {
  return ADAPTERS[id];
}

export function listMigrationAdapters(): MigrationAdapter[] {
  return Object.values(ADAPTERS);
}
