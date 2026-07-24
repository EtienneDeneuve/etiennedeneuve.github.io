#!/usr/bin/env node
/**
 * Post-build SEO checks on dist/ HTML.
 *
 * Fails when:
 * - title missing or duplicated (same-language content pages)
 * - canonical missing
 * - OG image path missing from dist (or /public/ in URL)
 * - any URL containing /public/
 * - JSON-LD invalid / unparsable
 * - draft / redirect URLs in sitemap
 * - language missing on content pages
 * - hreflang pointing at a page that does not exist in dist
 *
 * Astro redirect stubs are checked lightly (canonical + noindex + no /public/).
 *
 * Usage: node src/scripts/tests/test-seo-dist.mjs
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../../..");
const distDir = join(rootDir, "dist");
const siteConfigPath = join(rootDir, "src/config/site.ts");

const errors = [];

function fail(message) {
  errors.push(message);
}

function walk(dir, files = [], filterExt) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files, filterExt);
    } else if (!filterExt || filterExt.has(extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

function distUrlToFile(pathname) {
  let path = pathname.replace(/^https?:\/\/[^/]+/i, "");
  path = path.split("?")[0].split("#")[0];
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/public\//g, "/");

  const candidates = [];
  if (path.endsWith("/")) {
    candidates.push(join(distDir, path.slice(1), "index.html"));
  } else if (path.endsWith(".html")) {
    candidates.push(join(distDir, path.slice(1)));
  } else {
    candidates.push(join(distDir, path.slice(1), "index.html"));
    candidates.push(join(distDir, `${path.slice(1)}.html`));
  }
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function ogImageExists(imageUrl) {
  if (!imageUrl) return false;
  if (/\/public\//.test(imageUrl)) return false;
  try {
    const url = new URL(imageUrl, "https://etienne.deneuve.xyz");
    if (url.hostname.includes("etienne.deneuve.xyz") || url.pathname.startsWith("/")) {
      const local = join(distDir, url.pathname.replace(/^\//, ""));
      return existsSync(local);
    }
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAttr(tag, name) {
  const re = new RegExp(`${name}=["']([^"']+)["']`, "i");
  const match = tag.match(re);
  return match ? match[1] : null;
}

function languagePairKey(pathname) {
  const normalized = pathname.replace(/\/index\.html$/, "/").replace(/\\/g, "/");
  return normalized.replace(/^\/en(?=\/|$)/, "") || "/";
}

function isAstroRedirectPage(html) {
  return (
    /<title>\s*Redirecting to:/i.test(html) ||
    (/http-equiv=["']refresh["']/i.test(html) &&
      /name=["']robots["'][^>]*content=["']noindex/i.test(html))
  );
}

function isStandaloneAsset(rel) {
  return rel === "media-kit.html" || rel.endsWith("/media-kit.html") || rel.startsWith("assets/");
}

function verifySiteUrlConfig() {
  const content = readFileSync(siteConfigPath, "utf8");
  const match = content.match(/siteUrl:\s*["']([^"']+)["']/);
  if (!match) {
    fail("siteConfig.seo.siteUrl missing");
    return;
  }
  const siteUrl = match[1];
  if (!siteUrl.startsWith("https://")) {
    fail(`siteUrl must use https:// (got ${siteUrl})`);
  }
  if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
    fail(`siteUrl must not be localhost (got ${siteUrl})`);
  }
  if (siteUrl.includes("/public/")) {
    fail(`siteUrl must not contain /public/ (got ${siteUrl})`);
  }
}

function validateJsonLd(raw, file) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`${file}: invalid JSON-LD (${error.message})`);
    return;
  }

  const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
  const ids = [];

  for (const node of nodes) {
    if (!node || typeof node !== "object") {
      fail(`${file}: JSON-LD node is not an object`);
      continue;
    }
    if (!node["@type"] && !node["@graph"]) {
      fail(`${file}: JSON-LD node missing @type`);
    }
    const serialized = JSON.stringify(node);
    if (serialized.includes("/public/")) {
      fail(`${file}: JSON-LD contains /public/`);
    }
    if (node["@type"] === "Product") {
      fail(`${file}: Product schema is not allowed on this site`);
    }
    if (typeof node["@id"] === "string") {
      ids.push(node["@id"]);
      if (node["@id"].endsWith("/#person") || node["@id"].endsWith("/#organization")) {
        fail(`${file}: legacy JSON-LD @id ${node["@id"]} (use #etienne / #omnivya)`);
      }
    }
    if (node.url === "#") {
      fail(`${file}: placeholder JSON-LD url '#'`);
    }
  }

  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    fail(`${file}: duplicate JSON-LD @id values`);
  }
}

function isExcludedSitemapLoc(loc) {
  try {
    const path = new URL(loc).pathname;
    if (path.includes("/draft/") || path.includes("/design-system")) return true;
    if (path.includes("/:")) return true;
    if (/\/\d{4}\/\d{2}\/\d{2}\//.test(path)) return true;
    if (/\/thinking\/\d{4}\//.test(path)) return true;
    if (/^\/\d{4}-\d{2}-\d{2}-[^/]+\/?$/.test(path)) return true;
    if (
      path === "/blog/" ||
      path.startsWith("/blog/") ||
      path === "/offers/" ||
      path.startsWith("/offers/") ||
      path === "/case-studies/" ||
      path.startsWith("/case-studies/")
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

function main() {
  if (!existsSync(distDir)) {
    console.error("dist/ not found — run build first.");
    process.exit(1);
  }

  verifySiteUrlConfig();

  const htmlFiles = walk(distDir, [], new Set([".html"]));
  const titlesByLangKey = new Map();
  let contentPages = 0;
  let redirectPages = 0;

  for (const file of htmlFiles) {
    const rel = relative(distDir, file);
    const html = readFileSync(file, "utf8");
    const pagePath = `/${rel.replace(/index\.html$/, "").replace(/\\/g, "/")}`;

    if (html.includes("/public/")) {
      fail(`${rel}: HTML contains /public/ path`);
    }

    if (isStandaloneAsset(rel)) {
      continue;
    }

    if (isAstroRedirectPage(html)) {
      redirectPages += 1;
      const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
      if (!canonicalMatch) {
        fail(`${rel}: redirect page missing canonical`);
      } else {
        const href = extractAttr(canonicalMatch[0], "href");
        if (!href) fail(`${rel}: redirect canonical missing href`);
        if (href?.includes("/public/")) {
          fail(`${rel}: redirect canonical contains /public/`);
        }
      }
      if (!/noindex/i.test(html)) {
        fail(`${rel}: redirect page should be noindex`);
      }
      continue;
    }

    const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
    const robotsContent = robotsMatch ? (extractAttr(robotsMatch[0], "content") ?? "") : "";
    const isNoIndex = /noindex/i.test(robotsContent);

    contentPages += 1;

    if (!/<html[^>]*\slang=["'][^"']+["']/i.test(html)) {
      fail(`${rel}: missing html lang attribute`);
    }

    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      fail(`${rel}: missing <title>`);
    } else if (!isNoIndex) {
      const title = stripTags(titleMatch[1]).trim();
      const langMatch = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
      const lang = langMatch?.[1] ?? "und";
      const pairKey = languagePairKey(pagePath);
      const titleKey = `${lang}::${title}`;
      if (!titlesByLangKey.has(titleKey)) {
        titlesByLangKey.set(titleKey, []);
      }
      titlesByLangKey.get(titleKey).push({ rel, pairKey, pagePath });
    }

    // Lightweight gated/unavailable pages may be noindex without full SEO chrome.
    if (isNoIndex && rel.startsWith("design-system/")) {
      continue;
    }

    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
    if (!canonicalMatch) {
      fail(`${rel}: missing canonical link`);
    } else {
      const href = extractAttr(canonicalMatch[0], "href");
      if (!href) fail(`${rel}: canonical missing href`);
      if (href?.includes("/public/")) {
        fail(`${rel}: canonical contains /public/`);
      }
    }

    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i);
    if (!ogImageMatch) {
      fail(`${rel}: missing og:image`);
    } else {
      const image = extractAttr(ogImageMatch[0], "content");
      if (!image) {
        fail(`${rel}: og:image missing content`);
      } else if (!ogImageExists(image)) {
        fail(`${rel}: og:image does not resolve in dist (${image})`);
      }
    }

    const jsonLdBlocks = [
      ...html.matchAll(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      ),
    ];
    for (const block of jsonLdBlocks) {
      validateJsonLd(block[1].trim(), rel);
    }

    const hreflangs = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)];
    for (const match of hreflangs) {
      const tag = match[0];
      if (!/hreflang=/i.test(tag)) continue;
      const href = extractAttr(tag, "href");
      const hreflang = extractAttr(tag, "hreflang");
      if (!href || !hreflang) continue;
      if (href.includes("/public/")) {
        fail(`${rel}: hreflang ${hreflang} contains /public/`);
        continue;
      }
      if (extractAttr(tag, "type")?.includes("rss")) continue;
      const target = distUrlToFile(href);
      if (!target) {
        fail(`${rel}: hreflang ${hreflang} → missing page (${href})`);
        continue;
      }
      // hreflang must not point at a redirect stub
      const targetHtml = readFileSync(target, "utf8");
      if (isAstroRedirectPage(targetHtml)) {
        fail(`${rel}: hreflang ${hreflang} → redirect stub (${href})`);
      }
    }
  }

  for (const [titleKey, pages] of titlesByLangKey) {
    if (pages.length <= 1) continue;
    const uniquePairs = new Set(pages.map((p) => p.pairKey));
    if (uniquePairs.size > 1) {
      fail(
        `duplicate title "${titleKey.split("::").slice(1).join("::")}" on: ${pages
          .map((p) => p.rel)
          .join(", ")}`
      );
    }
  }

  const sitemapFiles = walk(distDir, [], new Set([".xml"])).filter((f) => /sitemap/i.test(f));
  for (const file of sitemapFiles) {
    const xml = readFileSync(file, "utf8");
    const rel = relative(distDir, file);
    if (xml.includes("/draft/") || /draft=/i.test(xml)) {
      fail(`${rel}: contains draft URL`);
    }
    if (xml.includes("/public/")) {
      fail(`${rel}: contains /public/`);
    }
    if (xml.includes("/design-system")) {
      fail(`${rel}: contains design-system URL`);
    }
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const loc = match[1];
      if (isExcludedSitemapLoc(loc)) {
        fail(`${rel}: excluded redirect/legacy URL still present (${loc})`);
      }
    }
  }

  const rssPath = join(distDir, "rss.xml");
  if (!existsSync(rssPath)) {
    fail("rss.xml missing from dist");
  } else {
    const rss = readFileSync(rssPath, "utf8");
    if (!rss.includes("<rss") && !rss.includes("<feed")) {
      fail("rss.xml is not a valid RSS/Atom document");
    }
    if (rss.includes("/public/")) {
      fail("rss.xml contains /public/");
    }
    if (!/<language>/i.test(rss) && !/xml:lang=/i.test(rss)) {
      fail("rss.xml missing language");
    }
  }

  for (const required of ["humans.txt", "llms.txt", "robots.txt"]) {
    if (!existsSync(join(distDir, required))) {
      fail(`${required} missing from dist`);
    }
  }

  if (errors.length > 0) {
    console.error(`test-seo-dist: ${errors.length} failure(s)`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log(`test-seo-dist: OK (${contentPages} content pages, ${redirectPages} redirect stubs)`);
}

main();
