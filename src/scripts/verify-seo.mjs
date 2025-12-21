#!/usr/bin/env node
/**
 * Verify SEO Configuration
 * 
 * This script verifies that siteUrl is properly configured for production builds.
 * Fails the build if siteUrl is missing or invalid in production.
 * 
 * Usage: node src/scripts/verify-seo.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");
const configPath = join(rootDir, "src/config/site.ts");

const isProduction = process.env.NODE_ENV === "production" || process.env.CI === "true";

try {
  const configContent = readFileSync(configPath, "utf-8");
  
  // Check if siteUrl is defined
  const siteUrlMatch = configContent.match(/url:\s*["']([^"']+)["']/);
  
  if (!siteUrlMatch) {
    console.error("❌ ERROR: siteUrl not found in site config");
    process.exit(1);
  }

  const siteUrl = siteUrlMatch[1];

  // Validate URL format
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== "https:") {
      console.warn(`⚠️  WARNING: siteUrl uses ${url.protocol} instead of https://`);
      if (isProduction) {
        console.error("❌ ERROR: Production builds must use https://");
        process.exit(1);
      }
    }

    if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
      console.error("❌ ERROR: siteUrl contains localhost or 127.0.0.1");
      if (isProduction) {
        process.exit(1);
      } else {
        console.warn("⚠️  WARNING: Using localhost in development");
      }
    }

    console.log(`✓ SEO config valid: siteUrl = ${siteUrl}`);
  } catch (urlError) {
    console.error(`❌ ERROR: Invalid siteUrl format: ${siteUrl}`);
    console.error(`   ${urlError.message}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ ERROR: Could not read config file: ${configPath}`);
  console.error(`   ${error.message}`);
  process.exit(1);
}

process.exit(0);
