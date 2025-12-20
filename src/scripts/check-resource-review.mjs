#!/usr/bin/env node
/**
 * Check Resource Review Dates
 * 
 * This script checks if resources have been reviewed within the last 365 days.
 * Fails the build if any resource is older than the threshold.
 * 
 * Usage: node src/scripts/check-resource-review.mjs [--threshold-days=365]
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");
const resourcesDir = join(rootDir, "src/content/resources");

// Parse threshold from args (default: 365 days)
const thresholdDays = process.argv
  .find((arg) => arg.startsWith("--threshold-days="))
  ?.split("=")[1] || "365";

const THRESHOLD_MS = parseInt(thresholdDays) * 24 * 60 * 60 * 1000;
const now = new Date();
const thresholdDate = new Date(now.getTime() - THRESHOLD_MS);

// Get all resource files
const resourceFiles = readdirSync(resourcesDir)
  .filter((file) => file.endsWith(".md"))
  .map((file) => join(resourcesDir, file));

const staleResources = [];
const errors = [];

resourceFiles.forEach((filePath) => {
  try {
    const content = readFileSync(filePath, "utf-8");
    const { data } = matter(content);

    if (!data.lastReviewed) {
      errors.push(`❌ ${filePath}: Missing 'lastReviewed' field`);
      return;
    }

    const lastReviewed = new Date(data.lastReviewed);
    if (lastReviewed.valueOf() < thresholdDate.getTime()) {
      const daysOld = Math.floor(
        (now.getTime() - lastReviewed.getTime()) / (24 * 60 * 60 * 1000)
      );
      staleResources.push({
        file: filePath.split("/").pop(),
        title: data.title || "Unknown",
        lastReviewed: lastReviewed.toISOString().split("T")[0],
        daysOld,
      });
    }
  } catch (error) {
    errors.push(`❌ Error reading ${filePath}: ${error.message}`);
  }
});

// Output results
if (errors.length > 0) {
  console.error("\n❌ Errors found:");
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

if (staleResources.length > 0) {
  console.error(`\n❌ ${staleResources.length} resource(s) need review (>${thresholdDays} days old):\n`);
  staleResources.forEach((resource) => {
    console.error(
      `  - ${resource.title} (${resource.file})\n    Last reviewed: ${resource.lastReviewed} (${resource.daysOld} days ago)`
    );
  });
  console.error(
    `\n⚠️  Please update the 'lastReviewed' field in these files and rebuild.\n`
  );
  process.exit(1);
}

console.log(`✓ All resources reviewed within the last ${thresholdDays} days`);
process.exit(0);
