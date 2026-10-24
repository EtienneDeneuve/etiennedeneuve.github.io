#!/usr/bin/env node
/**
 * Catch broken dated Thinking links before scheduled articles enter dist/.
 * The built-site linkcheck cannot see articles with a future pubDate.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MODERN_FROM = "2026-10-01";

export function checkEditorialLinks(docs, modernFrom = MODERN_FROM) {
  const known = new Set(docs.map((doc) => doc.id));
  const seenTitles = new Map();
  const issues = [];

  for (const doc of docs) {
    if (doc.id < modernFrom || !/^20\d{2}-\d{2}-\d{2}-/.test(doc.id)) continue;

    const title = String(doc.title || "").normalize("NFKC").trim().toLowerCase();
    const lang = doc.language || "fr";
    if (title) {
      const key = lang + ":" + title;
      const previous = seenTitles.get(key);
      if (previous) {
        issues.push({ file: doc.file, kind: "duplicate-title", ref: previous });
      } else {
        seenTitles.set(key, doc.file);
      }
    }

    for (const ref of doc.relatedArticles || []) {
      if (/^20\d{2}-\d{2}-\d{2}-/.test(ref) && !known.has(ref)) {
        issues.push({ file: doc.file, kind: "missing-related", ref });
      }
    }

    // Check modern article URLs in Markdown, including links in future posts.
    const articleLinks = /\/(?:en\/)?thinking\/(20\d{2}-\d{2}-\d{2}-[a-z0-9-]+)(?=\/|[?#)\s]|$)/g;
    for (const match of String(doc.body || "").matchAll(articleLinks)) {
      const ref = match[1];
      if (!known.has(ref)) {
        issues.push({ file: doc.file, kind: "missing-inline", ref });
      }
    }
  }
  return issues;
}

export function loadEditorialDocuments(rootDir = root) {
  const docs = [];
  for (const collection of ["blog", "articles"]) {
    const dir = join(rootDir, "src/content", collection);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((name) => /\.mdx?$/.test(name))) {
      const parsed = matter(readFileSync(join(dir, file), "utf8"));
      docs.push({
        file: "src/content/" + collection + "/" + file,
        id: basename(file).replace(/\.mdx?$/, ""),
        title: parsed.data.title,
        language: parsed.data.language || "fr",
        relatedArticles: parsed.data.relatedArticles || [],
        body: parsed.content,
      });
    }
  }
  return docs;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const docs = loadEditorialDocuments();
  const issues = checkEditorialLinks(docs);
  for (const issue of issues) {
    console.error("[editorial-links] " + issue.kind + " in " + issue.file + ": " + issue.ref);
  }
  if (issues.length) {
    console.error("[editorial-links] " + issues.length + " error(s) in dated article sources");
    process.exit(1);
  }
  console.log(
    "[editorial-links] OK: source links and unique titles (" + docs.length + " articles)"
  );
}
