#!/usr/bin/env node
/**
 * Validate content collections by syncing the Content Layer types.
 * Fails if src/content.config.ts or collection loaders are invalid.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
const contentConfig = join(rootDir, "src/content.config.ts");

if (!existsSync(contentConfig)) {
  console.error("ERROR: src/content.config.ts is missing");
  process.exit(1);
}

const result = spawnSync("pnpm", ["exec", "astro", "sync"], {
  cwd: rootDir,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("✓ Content collections synced");
