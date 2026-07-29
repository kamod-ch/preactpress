import { defineConfig } from "@kamod-ch/preactpress/config";
import { openapiPlugin } from "@preactpress/plugin-openapi";

export default defineConfig({
  site: {
    title: "OpenAPI Plugin Example",
    description: "Generated REST API reference from OpenAPI 3.x",
  },
  plugins: [
    openapiPlugin({
      input: "../fixtures/kamod-tasks/openapi.yaml",
      route: "/api",
    }),
  ],
});
