#!/usr/bin/env node
/**
 * Run `astro check` and fail when TypeScript/Astro diagnostics include errors.
 * (@astrojs/check may exit 0 even when errors are reported.)
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
const result = spawnSync("pnpm", ["exec", "astro", "check"], {
  cwd: rootDir,
  encoding: "utf8",
  shell: process.platform === "win32",
});

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");

const match = output.match(/-\s+(\d+)\s+errors?/i);
const errorCount = match ? Number(match[1]) : 0;

if (result.status && result.status !== 0) {
  process.exit(result.status);
}

if (errorCount > 0) {
  console.error(`\nastro check reported ${errorCount} error(s)`);
  process.exit(1);
}

process.exit(0);
