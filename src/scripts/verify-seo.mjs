#!/usr/bin/env node
/**
 * Verify SEO configuration. When dist/ exists, also runs HTML analyzer tests.
 *
 * Usage: node src/scripts/verify-seo.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const distDir = join(rootDir, "dist");
const distTest = join(rootDir, "src/scripts/tests/test-seo-dist.mjs");
const configPath = join(rootDir, "src/config/site.ts");

const configContent = readFileSync(configPath, "utf-8");
const siteUrlMatch = configContent.match(/siteUrl:\s*["']([^"']+)["']/);

if (!siteUrlMatch) {
  console.error("ERROR: siteUrl not found in site config");
  process.exit(1);
}

const siteUrl = siteUrlMatch[1];
try {
  const url = new URL(siteUrl);
  if (url.protocol !== "https:") {
    console.error("ERROR: siteUrl must use https://");
    process.exit(1);
  }
  if (
    siteUrl.includes("localhost") ||
    siteUrl.includes("127.0.0.1") ||
    siteUrl.includes("/public/")
  ) {
    console.error(`ERROR: invalid siteUrl: ${siteUrl}`);
    process.exit(1);
  }
  console.log(`✓ SEO config valid: siteUrl = ${siteUrl}`);
} catch (error) {
  console.error(`ERROR: Invalid siteUrl: ${error.message}`);
  process.exit(1);
}

if (existsSync(distDir)) {
  const result = spawnSync(process.execPath, [distTest], {
    stdio: "inherit",
    cwd: rootDir,
  });
  process.exit(result.status ?? 1);
}

console.log("(dist/ absent — skipped HTML checks; run after build)");
process.exit(0);
