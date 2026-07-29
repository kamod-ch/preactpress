import { defineConfig } from "@kamod-ch/preactpress/config";

/**
 * Minimal benchmark site config.
 * Navigation is intentionally tiny so sidebar config size does not skew scaling results.
 */
export default defineConfig({
  srcExclude: ["README.md"],
  outDir: "dist",
  cacheDir: ".preactpress/cache",
  site: {
    title: "PreactPress Benchmark",
    description: "Reproducible performance benchmark fixture",
  },
  markdown: {
    html: false,
  },
  themeConfig: {
    outline: true,
    search: true,
    nav: [{ text: "Home", link: "/" }],
    sidebar: [
      {
        text: "Benchmark",
        items: [{ text: "Home", link: "/" }],
      },
    ],
  },
});
