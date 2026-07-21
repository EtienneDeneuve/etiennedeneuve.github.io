#!/usr/bin/env node
/**
 * Internal linkcheck against a built dist/ tree.
 * Resolves site-absolute and root-relative hrefs to files on disk.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
const distDir = join(rootDir, "dist");

const IGNORE = [
  /^mailto:/i,
  /^tel:/i,
  /^javascript:/i,
  /^data:/i,
  /^#/,
  /^https?:\/\//i,
  /^\/\//, // protocol-relative
  /^\/cdn-cgi\//,
  /:/, // Astro redirect stubs like /:slug/
];

function walkHtml(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkHtml(full, files);
    else if (name.endsWith(".html")) files.push(full);
  }
  return files;
}

function resolveInternal(pathname) {
  const clean = pathname.split("#")[0].split("?")[0];
  if (!clean || clean === "/") {
    const index = join(distDir, "index.html");
    return existsSync(index) ? index : null;
  }

  const rel = clean.replace(/^\//, "").replace(/\/$/, "");
  const candidates = [
    join(distDir, rel, "index.html"),
    join(distDir, `${rel}.html`),
    join(distDir, rel),
  ];

  // Legacy WordPress date URLs often redirect under /thinking/
  if (/^\d{4}\/\d{2}\/\d{2}\//.test(rel)) {
    candidates.push(join(distDir, "thinking", rel, "index.html"));
    const slug = rel.split("/").pop();
    if (slug) {
      try {
        for (const name of readdirSync(join(distDir, "thinking"))) {
          if (name.endsWith(slug) || name.includes(slug)) {
            candidates.push(join(distDir, "thinking", name, "index.html"));
          }
        }
      } catch {
        // dist/thinking missing
      }
    }
  }

  for (const candidate of candidates) {
    const normalized = normalize(candidate);
    if (!normalized.startsWith(distDir)) continue;
    if (existsSync(normalized) && statSync(normalized).isFile()) return normalized;
  }
  return null;
}

function extractHrefs(html) {
  const hrefs = [];
  const re = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    hrefs.push(match[1]);
  }
  return hrefs;
}

if (!existsSync(distDir)) {
  console.error("ERROR: dist/ missing — run build first");
  process.exit(1);
}

const pages = walkHtml(distDir);
const broken = [];
let checked = 0;

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const href of extractHrefs(html)) {
    if (IGNORE.some((pattern) => pattern.test(href))) continue;
    if (!href.startsWith("/")) continue;
    if (/\.(png|jpe?g|gif|webp|svg|ico|pdf|xml|txt|json|woff2?|ttf|css|js|map)$/i.test(href)) {
      const asset = join(distDir, href.replace(/^\//, ""));
      checked += 1;
      if (!existsSync(asset)) {
        broken.push({ page, href });
      }
      continue;
    }
    checked += 1;
    if (!resolveInternal(href)) {
      broken.push({ page, href });
    }
  }
}

console.log(`Checked ${checked} internal links across ${pages.length} HTML files`);

if (broken.length > 0) {
  console.error(`\n✗ ${broken.length} broken internal link(s):`);
  for (const item of broken.slice(0, 40)) {
    const relPage = item.page.replace(`${distDir}/`, "dist/");
    console.error(`  ${relPage} → ${item.href}`);
  }
  if (broken.length > 40) {
    console.error(`  ... and ${broken.length - 40} more`);
  }
  process.exit(1);
}

console.log("✓ Internal links OK");
