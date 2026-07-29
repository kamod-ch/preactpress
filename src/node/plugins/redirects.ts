import type { PreactPressPlugin } from "../pluginTypes.js";
import { validateRedirectsForCheck } from "../redirects.js";

/** Validates redirect rules during build start and logs a concise summary. */
export function redirectsPlugin(): PreactPressPlugin {
  return {
    name: "preactpress:redirects",
    enforce: "pre",
    buildStart(ctx) {
      const { redirects, routes = [] } = ctx.config;
      if (!redirects.rules.length) return;
      const issues = validateRedirectsForCheck(redirects, new Set(routes));
      const errors = issues.filter((issue) => issue.level === "error");
      if (errors.length) {
        throw new Error(errors.map((issue) => issue.message).join("; "));
      }
      ctx.logger.info(
        `redirects: ${redirects.rules.length} rule(s), html fallbacks=${redirects.generateHtmlFallbacks}, _redirects=${redirects.generateRedirectsFile}`,
        { timestamp: true },
      );
    },
  };
}
