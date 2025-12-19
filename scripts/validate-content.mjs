#!/usr/bin/env node

/**
 * Simple content validator for blog posts.
 *
 * Checks:
 * - Required frontmatter fields: title, description, pubDate
 * - Minimum description length
 * - Tags present (non-empty)
 *
 * Usage:
 *   pnpm validate:content
 *
 * Also wired as a FrontMatter custom script so it can be run from the UI.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

async function findMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath];
      }
      return [];
    }),
  );
  return files.flat();
}

function extractFrontmatter(raw) {
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};
  const yamlBlock = raw.slice(3, end + 1);
  // Very small YAML subset: key: value, no nested objects/arrays parsing.
  const data = {};
  for (const line of yamlBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"")) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

async function main() {
  const root = process.cwd();
  const blogDir = path.join(root, "src", "content", "blog");

  let files = [];
  try {
    files = await findMarkdownFiles(blogDir);
  } catch (err) {
    console.error(`[content-validate] Failed to read blog directory: ${err}`);
    process.exitCode = 1;
    return;
  }

  const problems = [];

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const fm = extractFrontmatter(raw);

    const rel = path.relative(root, file);
    const fileIssues = [];

    // Required fields
    for (const field of ["title", "description", "pubDate"]) {
      if (!fm[field]) {
        fileIssues.push(`missing required field "${field}"`);
      }
    }

    // Description length
    if (fm.description && fm.description.length < 40) {
      fileIssues.push(
        `description is very short (${fm.description.length} chars)`,
      );
    }

    // Tags (just presence, not strict)
    if (!("tags" in fm)) {
      fileIssues.push(`no "tags" field defined`);
    }

    if (fileIssues.length > 0) {
      problems.push({ file: rel, issues: fileIssues });
    }
  }

  if (problems.length === 0) {
    console.log("[content-validate] All blog posts look good ✅");
    return;
  }

  console.log(
    `[content-validate] Found issues in ${problems.length} file(s):\n`,
  );
  for (const { file, issues } of problems) {
    console.log(`- ${file}`);
    for (const issue of issues) {
      console.log(`  • ${issue}`);
    }
  }

  // Non-zero exit for CI / scripts.
  process.exitCode = 1;
}

main().catch((err) => {
  console.error("[content-validate] Unexpected error:", err);
  process.exitCode = 1;
});


