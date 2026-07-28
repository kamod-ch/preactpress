import { defineConfig } from "@kamod-ch/preactpress/config";
import { typedocPlugin } from "@preactpress/plugin-typedoc";

export default defineConfig({
  site: {
    title: "Sample API Docs",
    description: "TypeDoc plugin example",
  },
  plugins: [
    typedocPlugin({
      entries: ["../fixtures/sample-lib/src/index.ts", "../fixtures/sample-lib/src/geometry.ts"],
      tsconfig: "../fixtures/sample-lib/tsconfig.json",
      output: "reference/api",
      includePrivate: false,
    }),
  ],
});
