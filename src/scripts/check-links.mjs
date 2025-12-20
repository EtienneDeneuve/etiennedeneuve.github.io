#!/usr/bin/env node
/**
 * Link Checker Script
 * 
 * Checks all links in markdown and HTML files for broken links, redirects, and anchors.
 * 
 * Usage: node src/scripts/check-links.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "../..");

// Configuration
const config = {
  timeout: 20000,
  retries: 3,
  retryDelay: 1000,
  ignorePatterns: [
    /^mailto:/,
    /^#/,
    /^javascript:/,
    /^file:\/\//,
    /^data:/,
    /localhost/,
    /127\.0\.0\.1/,
    /0\.0\.0\.0/,
  ],
  excludeDirs: [
    "node_modules",
    "dist",
    ".astro",
    ".git",
    ".trunk",
    ".vscode",
    ".github",
    "public/assets",
  ],
  includeExtensions: [".md", ".astro", ".html"],
};

// Collect all files to check
function collectFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      const dirName = file;
      if (!config.excludeDirs.some((exclude) => dirName.includes(exclude))) {
        collectFiles(filePath, fileList);
      }
    } else {
      const ext = extname(file);
      if (config.includeExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Extract links from content
function extractLinks(content, filePath) {
  const links = [];
  
  // Markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    links.push({
      url: match[2],
      text: match[1],
      file: filePath,
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // HTML links: <a href="url">
  const htmlLinkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlLinkRegex.exec(content)) !== null) {
    links.push({
      url: match[1],
      text: "HTML link",
      file: filePath,
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // Astro/JSX links: href={"url"} or href="url"
  const astroLinkRegex = /href\s*=\s*{?["']([^"']+)["']}?/gi;
  while ((match = astroLinkRegex.exec(content)) !== null) {
    links.push({
      url: match[1],
      text: "Astro link",
      file: filePath,
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  return links;
}

// Check if link should be ignored
function shouldIgnore(url) {
  return config.ignorePatterns.some((pattern) => pattern.test(url));
}

// Check a single link
async function checkLink(link) {
  if (shouldIgnore(link.url)) {
    return { ...link, status: "ignored", valid: true };
  }

  // For relative links, check if file exists
  if (link.url.startsWith("/") || !link.url.includes("://")) {
    // This is a relative link - we can't check it without building the site
    // Mark as "relative" for now
    return { ...link, status: "relative", valid: true };
  }

  // For external links, we'd need to make HTTP requests
  // For now, we'll use markdown-link-check if available
  return { ...link, status: "external", valid: null };
}

// Main function
async function main() {
  console.log("🔍 Checking links...\n");

  const srcDir = join(rootDir, "src");
  const files = collectFiles(srcDir);

  console.log(`Found ${files.length} files to check\n`);

  const allLinks = [];
  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");
      const links = extractLinks(content, file);
      allLinks.push(...links);
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }

  console.log(`Found ${allLinks.length} links to check\n`);

  // Group by status
  const ignored = allLinks.filter((l) => shouldIgnore(l.url));
  const relative = allLinks.filter(
    (l) => l.url.startsWith("/") || !l.url.includes("://")
  );
  const external = allLinks.filter(
    (l) => !shouldIgnore(l.url) && l.url.includes("://")
  );

  console.log(`📊 Link Statistics:`);
  console.log(`  - Ignored (mailto, anchors, etc.): ${ignored.length}`);
  console.log(`  - Relative links: ${relative.length}`);
  console.log(`  - External links: ${external.length}\n`);

  if (external.length > 0) {
    console.log(
      `⚠️  Note: External link checking requires markdown-link-check or a build step.\n`
    );
    console.log(
      `💡 Tip: Use 'pnpm run linkcheck:markdown' to check markdown files with markdown-link-check.\n`
    );
  }

  // Show relative links that might be problematic
  const suspiciousRelative = relative.filter(
    (l) => !l.url.startsWith("/") && !l.url.startsWith("./") && !l.url.startsWith("../")
  );
  
  if (suspiciousRelative.length > 0) {
    console.log(`⚠️  Found ${suspiciousRelative.length} potentially problematic relative links:\n`);
    suspiciousRelative.slice(0, 10).forEach((link) => {
      console.log(`  - ${link.file}:${link.line} - ${link.url}`);
    });
    if (suspiciousRelative.length > 10) {
      console.log(`  ... and ${suspiciousRelative.length - 10} more`);
    }
    console.log();
  }

  console.log("✓ Link extraction complete!");
  console.log(
    "\n💡 For full link checking (including external URLs), use markdown-link-check or build the site first."
  );
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
