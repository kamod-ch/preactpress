import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  defineConfig({
    test: {
      environment: "node",
      include: ["tests/**/*.test.ts"],
    },
  }),
  {},
);
