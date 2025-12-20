#!/usr/bin/env node
/**
 * Verify Git Dates Script
 * 
 * This script verifies that git dates can be retrieved for blog posts.
 * Used as a build-time assertion to catch issues early.
 * 
 * Usage: node src/scripts/verify-git-dates.mjs
 */

import { execSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");
const blogDir = join(rootDir, "src/content/blog");

// Check if git is available
let gitAvailable = false;
try {
  execSync("git --version", { stdio: "ignore" });
  gitAvailable = true;
} catch {
  console.warn("⚠️  Git is not available. Date verification skipped.");
  process.exit(0);
}

// Check if we're in a git repo
let inGitRepo = false;
try {
  execSync("git rev-parse --git-dir", { stdio: "ignore", cwd: rootDir });
  inGitRepo = true;
} catch {
  console.warn("⚠️  Not in a git repository. Date verification skipped.");
  process.exit(0);
}

// Get all blog files
const blogFiles = readdirSync(blogDir)
  .filter((file) => file.endsWith(".md"))
  .map((file) => join(blogDir, file));

let errors = [];
let warnings = [];

blogFiles.forEach((filePath) => {
  try {
    const content = readFileSync(filePath, "utf-8");
    const { data } = matter(content);

    if (!data.pubDate) {
      warnings.push(`⚠️  ${filePath.split("/").pop()}: Missing pubDate`);
      return;
    }

    // Try to get git last modified
    try {
      const gitDate = execSync(
        `git log -1 --format=%cI -- "${filePath}"`,
        { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], cwd: rootDir }
      ).trim();

      if (!gitDate) {
        warnings.push(`⚠️  ${filePath.split("/").pop()}: No git history`);
        return;
      }

      const pubDate = new Date(data.pubDate);
      const gitDateObj = new Date(gitDate);
      const daysDiff = (gitDateObj.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);

      // Warn if git date is before pub date (shouldn't happen)
      if (daysDiff < 0) {
        warnings.push(
          `⚠️  ${filePath.split("/").pop()}: Git date (${gitDate}) is before pubDate (${data.pubDate})`
        );
      }
    } catch (gitError) {
      // File might not be tracked or have no history - this is OK
      if (!gitError.message.includes("does not have any commits yet")) {
        warnings.push(`⚠️  ${filePath.split("/").pop()}: Could not get git date: ${gitError.message}`);
      }
    }
  } catch (error) {
    errors.push(`❌ ${filePath.split("/").pop()}: ${error.message}`);
  }
});

// Output results
if (errors.length > 0) {
  console.error("\n❌ Errors found:");
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("\n⚠️  Warnings:");
  warnings.forEach((warning) => console.warn(warning));
  console.warn("\n⚠️  These warnings are non-blocking but should be reviewed.\n");
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`✓ All ${blogFiles.length} blog posts have valid dates`);
}

process.exit(0);
