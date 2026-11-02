import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "local-search.spec.ts",
  workers: 1,
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:4175" },
  webServer: {
    env: { NODE_ENV: "production" },
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    command:
      "node ./bin/preactpress.mjs build templates/docs --base /manual/ && node ./bin/preactpress.mjs preview templates/docs --base /manual/ --host 127.0.0.1 --port 4175",
    url: "http://127.0.0.1:4175/manual/guide/getting-started",
    timeout: 120_000,
  },
});
