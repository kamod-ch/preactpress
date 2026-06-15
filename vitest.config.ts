import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/node/**/*.ts", "src/shared/**/*.ts"],
      exclude: [
        "src/node/cli.ts",
        "src/node/index.ts",
        "src/node/packageRoot.ts",
        "src/node/serve.ts",
        "src/node/server.ts",
      ],
      thresholds: {
        branches: 60,
        functions: 65,
        lines: 70,
        statements: 70,
      },
    },
  },
});
