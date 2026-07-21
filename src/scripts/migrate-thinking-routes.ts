#!/usr/bin/env bun
/**
 * Analyze legacy blog routes and produce a redirect table before any content move.
 * Does NOT modify article bodies or frontmatter automatically.
 *
 * Usage:
 *   pnpm run migrate:thinking-routes
 *   pnpm run migrate:thinking-routes -- --write-redirects
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const blogDir = join(rootDir, "src/content/blog");
const dataDir = join(rootDir, "src/data");
const docsDir = join(rootDir, "docs");

type ArticleRecord = {
  file: string;
  astroSlug: string;
  legacySlug: string | null;
  canonicalPath: string;
  legacyPaths: string[];
  draft: boolean;
  reviewFlags: string[];
};

type RedirectEntry = {
  from: string;
  to: string;
  reason: string;
  sourceFile: string;
};

function normalizeSlug(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  return raw.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

function astroSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function loadArticles(): ArticleRecord[] {
  const files = readdirSync(blogDir).filter((name) => name.endsWith(".md"));
  return files.map((filename) => {
    const filePath = join(blogDir, filename);
    const raw = readFileSync(filePath, "utf8");
    const { data } = matter(raw);
    const astroSlug = astroSlugFromFilename(filename);
    const legacySlug = normalizeSlug(data.slug);
    const canonicalPath = `/thinking/${astroSlug}/`;
    const legacyPaths = new Set<string>();
    const reviewFlags: string[] = [];

    if (legacySlug && legacySlug !== astroSlug) {
      legacyPaths.add(`/${legacySlug}/`);
      legacyPaths.add(`/${legacySlug}`);
      legacyPaths.add(`/thinking/${legacySlug}/`);
      legacyPaths.add(`/thinking/${legacySlug}`);
    }

    if (!data.description || String(data.description).trim().length < 12) {
      reviewFlags.push("missing-or-short-description");
    }
    if (!data.title || String(data.title).trim().length < 5) {
      reviewFlags.push("missing-or-short-title");
    }
    if (!data.contentType || data.contentType === "technical-guide") {
      reviewFlags.push("default-content-type-review");
    }
    if (!data.pillar || data.pillar === "cloud-and-infrastructure") {
      reviewFlags.push("default-pillar-review");
    }
    if (Array.isArray(data.tags) && data.tags.some((tag) => tag === "")) {
      reviewFlags.push("empty-tag-values");
    }

    return {
      file: filename,
      astroSlug,
      legacySlug,
      canonicalPath,
      legacyPaths: [...legacyPaths],
      draft: Boolean(data.draft),
      reviewFlags,
    };
  });
}

function detectCollisions(articles: ArticleRecord[]) {
  const canonicalTargets = new Map<string, string[]>();
  const legacyTargets = new Map<string, string[]>();

  for (const article of articles) {
    const list = canonicalTargets.get(article.canonicalPath) ?? [];
    list.push(article.file);
    canonicalTargets.set(article.canonicalPath, list);

    for (const legacyPath of article.legacyPaths) {
      const legacyList = legacyTargets.get(legacyPath) ?? [];
      legacyList.push(article.file);
      legacyTargets.set(legacyPath, legacyList);
    }
  }

  const canonicalCollisions = [...canonicalTargets.entries()].filter(
    ([, files]) => files.length > 1
  );
  const legacyCollisions = [...legacyTargets.entries()].filter(([, files]) => files.length > 1);
  return { canonicalCollisions, legacyCollisions };
}

function buildRedirects(articles: ArticleRecord[]): RedirectEntry[] {
  const redirects: RedirectEntry[] = [];

  for (const article of articles) {
    if (article.draft) continue;

    for (const legacyPath of article.legacyPaths) {
      redirects.push({
        from: ensureLeadingSlash(legacyPath.replace(/\/$/, "")),
        to: article.canonicalPath,
        reason: "legacy-slug-to-canonical-thinking",
        sourceFile: article.file,
      });
    }
  }

  const deduped = new Map<string, RedirectEntry>();
  for (const entry of redirects) {
    const existing = deduped.get(entry.from);
    if (!existing) {
      deduped.set(entry.from, entry);
      continue;
    }
    if (existing.to !== entry.to) {
      entry.reason = `collision-conflict:${existing.sourceFile}+${entry.sourceFile}`;
    }
  }

  return [...deduped.values()].sort((a, b) => a.from.localeCompare(b.from));
}

function renderReport(
  articles: ArticleRecord[],
  redirects: RedirectEntry[],
  collisions: ReturnType<typeof detectCollisions>
): string {
  const needsReview = articles.filter((article) => article.reviewFlags.length > 0);
  const lines = [
    "# Thinking migration report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Articles scanned: ${articles.length}`,
    `- Redirects proposed: ${redirects.length}`,
    `- Articles needing manual review: ${needsReview.length}`,
    `- Canonical slug collisions: ${collisions.canonicalCollisions.length}`,
    `- Legacy path collisions: ${collisions.legacyCollisions.length}`,
    "",
    "## Manual review queue",
    "",
  ];

  for (const article of needsReview) {
    lines.push(`### ${article.file}`);
    lines.push(`- Canonical: \`${article.canonicalPath}\``);
    if (article.legacySlug) lines.push(`- Legacy slug: \`${article.legacySlug}\``);
    for (const flag of article.reviewFlags) {
      lines.push(`- ⚠ ${flag}`);
    }
    lines.push("");
  }

  lines.push("## Redirect table (sample)");
  lines.push("");
  lines.push("| From | To | Reason | Source |");
  lines.push("|------|----|--------|--------|");
  for (const redirect of redirects.slice(0, 40)) {
    lines.push(
      `| \`${redirect.from}\` | \`${redirect.to}\` | ${redirect.reason} | ${redirect.sourceFile} |`
    );
  }
  if (redirects.length > 40) {
    lines.push(`| … | … | ${redirects.length - 40} more in JSON | |`);
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const writeRedirects = process.argv.includes("--write-redirects");
  const articles = loadArticles();
  const collisions = detectCollisions(articles);
  const redirects = buildRedirects(articles);
  const needsReview = articles.filter((article) => article.reviewFlags.length > 0);

  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    canonicalBase: "/thinking/",
    redirects,
    collisions,
    reviewQueue: needsReview.map((article) => ({
      file: article.file,
      canonicalPath: article.canonicalPath,
      legacySlug: article.legacySlug,
      flags: article.reviewFlags,
    })),
  };

  writeFileSync(
    join(dataDir, "thinking-redirects.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf-8"
  );
  writeFileSync(
    join(docsDir, "thinking-migration-report.md"),
    renderReport(articles, redirects, collisions),
    "utf-8"
  );

  console.log(`✓ Wrote src/data/thinking-redirects.json (${redirects.length} redirects)`);
  console.log(`✓ Wrote docs/thinking-migration-report.md`);
  console.log(`ℹ ${needsReview.length} article(s) flagged for manual review`);

  if (collisions.canonicalCollisions.length > 0 || collisions.legacyCollisions.length > 0) {
    console.warn("⚠ Collisions detected — resolve before applying redirects");
    for (const [path, files] of collisions.legacyCollisions) {
      console.warn(`  legacy ${path}: ${files.join(", ")}`);
    }
  }

  if (writeRedirects) {
    console.log("ℹ Redirect JSON updated. Merge into astro.config.mjs manually or via CI step.");
  } else {
    console.log("ℹ Run with --write-redirects after reviewing docs/thinking-migration-report.md");
  }
}

main();
