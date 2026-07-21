#!/usr/bin/env node
/**
 * Ensures no GitHub tokens or secrets are emitted into dist/.
 *
 * Usage: node src/scripts/tests/test-no-secrets-in-dist.mjs
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../../../dist");

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9_]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /gho_[A-Za-z0-9_]{20,}/,
  /ghu_[A-Za-z0-9_]{20,}/,
  /ghs_[A-Za-z0-9_]{20,}/,
  /ghr_[A-Za-z0-9_]{20,}/,
  /\bGITHUB_TOKEN\s*=\s*['"][^'"]+['"]/,
  /\bgh_token['"]?\s*:\s*['"][^'"]+['"]/i,
  /Bearer\s+gh[pousr]_[A-Za-z0-9_]+/,
  /api\.github\.com\/.*access_token=/i,
];

const TEXT_EXTENSIONS = new Set([".html", ".js", ".css", ".json", ".xml", ".txt", ".map", ".svg"]);

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (TEXT_EXTENSIONS.has(extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  if (!existsSync(distDir)) {
    console.error("dist/ not found — run build first.");
    process.exit(1);
  }

  const violations = [];

  for (const file of walk(distDir)) {
    const content = readFileSync(file, "utf8");
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        violations.push({ file, pattern: pattern.source });
      }
    }

    if (
      /api\.github\.com/i.test(content) &&
      /client:load|fetch\s*\(\s*['"]https:\/\/api\.github/.test(content)
    ) {
      violations.push({
        file,
        pattern: "client-side GitHub API fetch",
      });
    }
  }

  if (violations.length > 0) {
    console.error("Secret or client-side GitHub token patterns found in dist/:");
    for (const v of violations) {
      console.error(`  - ${v.file} (${v.pattern})`);
    }
    process.exit(1);
  }

  console.log("test-no-secrets-in-dist: OK");
}

main();
