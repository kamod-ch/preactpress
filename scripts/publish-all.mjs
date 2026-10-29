import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePublishCliArgs } from "./publish-selection.mjs";
import { runPublishPipeline } from "./publish-execution.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = parsePublishCliArgs(process.argv.slice(2));

runPublishPipeline(packageRoot, args).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
