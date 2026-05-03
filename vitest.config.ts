import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@kahf/domain": resolve(rootDir, "packages/domain/src"),
      "@kahf/finance": resolve(rootDir, "packages/finance/src"),
      "@kahf/config": resolve(rootDir, "packages/config/src"),
    },
  },
  test: {
    include: ["packages/**/__tests__/**/*.test.ts"],
  },
});
