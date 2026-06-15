import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Root of the `preactpress` package (contains `package.json`). */
export const PACKAGE_ROOT = path.resolve(here, "../..");

export const DEFAULT_THEME_LAYOUT = path.join(PACKAGE_ROOT, "src/client/theme-default/Layout.tsx");
