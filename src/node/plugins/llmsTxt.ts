import type { PreactPressPlugin } from "../pluginTypes.js";
import { writeAiExports } from "../aiExports.js";

/** Writes AI-oriented documentation exports during production builds when `ai` is enabled. */
export function aiExportsPlugin(): PreactPressPlugin {
  return {
    name: "preactpress:ai-exports",
    enforce: "post",
    buildEnd: async (result, ctx) => {
      if (ctx.config.ai === false) return;
      await writeAiExports(ctx.config, result, ctx.logger);
    },
  };
}

/** @deprecated Use {@link aiExportsPlugin} — kept for backwards compatibility. */
export function llmsTxtPlugin(): PreactPressPlugin {
  return aiExportsPlugin();
}
