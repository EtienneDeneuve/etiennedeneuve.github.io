import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import {
  thinkingConfig,
  type ThinkingContentType,
  type ThinkingPillar,
  type ThinkingSort,
} from "../config/thinking.ts";
import { getReleasedArticles } from "./publication-policy.ts";
import thinkingRedirects from "../data/thinking-redirects.json";

export type { ThinkingContentType, ThinkingPillar, ThinkingSort };

export type ThinkingArticle = CollectionEntry<"blog"> | CollectionEntry<"articles">;

export type ThinkingFilters = {
  pillar?: ThinkingPillar;
  contentType?: ThinkingContentType;
  language?: "fr" | "en";
  tag?: string;
  sort?: ThinkingSort;
};

function normalizeLegacySlug(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  return raw
    .replace(/^\/thinking\//, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

type RedirectRow = {
  from: string;
  to: string;
  sourceFile?: string;
};

let canonicalMaps: {
  byLegacy: Map<string, string>;
  bySourceFile: Map<string, string>;
} | null = null;

function getCanonicalMaps() {
  if (canonicalMaps) return canonicalMaps;
  const byLegacy = new Map<string, string>();
  const bySourceFile = new Map<string, string>();
  for (const entry of (thinkingRedirects.redirects ?? []) as RedirectRow[]) {
    if (!entry.to?.startsWith("/thinking/")) continue;
    const canonical = normalizeLegacySlug(entry.to.replace(/^\/thinking\//, ""));
    if (!canonical) continue;
    const from = normalizeLegacySlug(entry.from);
    if (from) byLegacy.set(from, canonical);
    if (entry.sourceFile) {
      bySourceFile.set(entry.sourceFile.replace(/\.mdx?$/i, ""), canonical);
    }
  }
  canonicalMaps = { byLegacy, bySourceFile };
  return canonicalMaps;
}

function isWordPressDateSlug(slug: string): boolean {
  return /^\d{4}\/\d{2}\/\d{2}\//.test(slug);
}

/** Best-effort file stem from Astro entry id. */
function fileBasedSlug(entry: ThinkingArticle): string {
  return entry.id.replace(/\\/g, "/").replace(/\.mdx?$/i, "");
}

/**
 * Canonical article slug for public URLs.
 * Frontmatter `slug` is the legacy WordPress path; the filename is canonical.
 */
export function getCanonicalSlug(entry: ThinkingArticle): string {
  const maps = getCanonicalMaps();
  const fromFile = fileBasedSlug(entry);
  const dataSlug = normalizeLegacySlug((entry.data as { slug?: string }).slug);
  const entrySlug = normalizeLegacySlug(entry.id);

  if (dataSlug && maps.byLegacy.has(dataSlug)) {
    return maps.byLegacy.get(dataSlug)!;
  }
  if (entrySlug && maps.byLegacy.has(entrySlug)) {
    return maps.byLegacy.get(entrySlug)!;
  }
  if (maps.bySourceFile.has(fromFile)) {
    return maps.bySourceFile.get(fromFile)!;
  }
  // Filename still available as id (not overwritten by custom slug)
  if (fromFile && !isWordPressDateSlug(fromFile) && !fromFile.includes("/")) {
    return fromFile;
  }
  if (dataSlug && isWordPressDateSlug(dataSlug) && fromFile && !isWordPressDateSlug(fromFile)) {
    return fromFile;
  }
  return fromFile || entrySlug || dataSlug || entry.id;
}

export function getLegacySlug(entry: ThinkingArticle): string | null {
  const canonical = getCanonicalSlug(entry);
  const dataSlug = normalizeLegacySlug((entry.data as { slug?: string }).slug);
  if (dataSlug && dataSlug !== canonical) return dataSlug;
  const entrySlug = normalizeLegacySlug(entry.id);
  if (entrySlug && entrySlug !== canonical) return entrySlug;
  return null;
}

export function getArticlePath(slug: string, lang: "fr" | "en"): string {
  return lang === "en" ? `/en/thinking/${slug}/` : `/thinking/${slug}/`;
}

export async function getAllThinkingArticles(): Promise<ThinkingArticle[]> {
  const blog = await getCollection("blog");
  let articles: CollectionEntry<"articles">[] = [];
  try {
    articles = await getCollection("articles");
  } catch {
    // Collection may be empty during progressive migration from blog → articles.
  }
  const merged = [...blog, ...articles];
  const seen = new Set<string>();
  const unique: ThinkingArticle[] = [];
  for (const entry of merged) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    unique.push(entry);
  }
  return getReleasedArticles(unique);
}

export function getArticleLanguage(entry: ThinkingArticle): "fr" | "en" {
  const lang = entry.data.language;
  return lang === "en" ? "en" : "fr";
}

export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEntryTags(entry: ThinkingArticle): string[] {
  return (entry.data.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
}

export function getPillarLabel(pillar: ThinkingPillar, lang: "fr" | "en"): string {
  return thinkingConfig.pillarLabels[pillar]?.[lang] ?? pillar;
}

export function getContentTypeLabel(type: ThinkingContentType, lang: "fr" | "en"): string {
  return thinkingConfig.contentTypeLabels[type]?.[lang] ?? type;
}

export function formatArticleDate(date: Date, lang: "fr" | "en"): string {
  return date.toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getReadingTime(entry: ThinkingArticle): string | null {
  const data = entry.data as { minutesRead?: string };
  return data.minutesRead ?? null;
}

export function shouldShowUpdatedDate(entry: ThinkingArticle): boolean {
  const { pubDate, lastModified } = entry.data;
  if (!lastModified) return false;
  const pub = pubDate instanceof Date ? pubDate : new Date(pubDate);
  const updated = lastModified instanceof Date ? lastModified : new Date(lastModified);
  if (Number.isNaN(pub.getTime()) || Number.isNaN(updated.getTime())) return false;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.abs(updated.getTime() - pub.getTime()) >= dayMs;
}

export function isFeatured(entry: ThinkingArticle): boolean {
  if (entry.data.featured) return true;
  return (thinkingConfig.featuredSlugs as readonly string[]).includes(entry.id);
}

export function sortArticles(
  entries: ThinkingArticle[],
  sort: ThinkingSort = "featured"
): ThinkingArticle[] {
  const copy = [...entries];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
    case "title":
      return copy.sort((a, b) => a.data.title.localeCompare(b.data.title));
    case "recent":
      return copy.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
    case "featured":
    default:
      return copy.sort((a, b) => {
        const featuredDiff = Number(isFeatured(b)) - Number(isFeatured(a));
        if (featuredDiff !== 0) return featuredDiff;
        const featured = thinkingConfig.featuredSlugs as readonly string[];
        const orderA = featured.indexOf(a.id);
        const orderB = featured.indexOf(b.id);
        if (orderA !== -1 || orderB !== -1) {
          return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
        }
        return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
      });
  }
}

export function filterArticles(
  entries: ThinkingArticle[],
  filters: ThinkingFilters
): ThinkingArticle[] {
  return entries.filter((entry) => {
    if (filters.pillar && entry.data.pillar !== filters.pillar) return false;
    if (filters.contentType && entry.data.contentType !== filters.contentType) return false;
    if (filters.language && getArticleLanguage(entry) !== filters.language) return false;
    if (filters.tag) {
      const tags = getEntryTags(entry).map(slugifyTag);
      if (!tags.includes(filters.tag)) return false;
    }
    return true;
  });
}

export function parseThinkingFilters(searchParams: URLSearchParams): ThinkingFilters {
  const sort = searchParams.get("sort") as ThinkingSort | null;
  const pillar = searchParams.get("pillar") as ThinkingPillar | null;
  const contentType = searchParams.get("type") as ThinkingContentType | null;
  const language = searchParams.get("lang") as "fr" | "en" | null;
  const tag = searchParams.get("tag");

  return {
    pillar: pillar && thinkingConfig.pillarLabels[pillar] ? pillar : undefined,
    contentType:
      contentType && thinkingConfig.contentTypeLabels[contentType] ? contentType : undefined,
    language: language === "fr" || language === "en" ? language : undefined,
    tag: tag ? slugifyTag(tag) : undefined,
    sort: sort && thinkingConfig.sortLabels[sort] ? sort : undefined,
  };
}

export function getTagCounts(entries: ThinkingArticle[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of getEntryTags(entry)) {
      const slug = slugifyTag(tag);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return counts;
}

export function getQualifyingTags(entries: ThinkingArticle[]): Array<{
  slug: string;
  label: string;
  count: number;
}> {
  const counts = getTagCounts(entries);
  const labels = new Map<string, string>();
  for (const entry of entries) {
    for (const tag of getEntryTags(entry)) {
      const slug = slugifyTag(tag);
      if (!labels.has(slug)) labels.set(slug, tag);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= thinkingConfig.minTagArticles)
    .map(([slug, count]) => ({ slug, label: labels.get(slug) ?? slug, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getFeaturedArticles(entries: ThinkingArticle[]): ThinkingArticle[] {
  return sortArticles(entries.filter(isFeatured), "featured");
}

export function getTranslationSiblings(
  entry: ThinkingArticle,
  all: ThinkingArticle[]
): ThinkingArticle[] {
  const key = entry.data.translationKey;
  if (!key) return [];
  return all.filter(
    (candidate) => candidate.id !== entry.id && candidate.data.translationKey === key
  );
}

export function getPrevNextArticles(
  entry: ThinkingArticle,
  all: ThinkingArticle[]
): { prev: ThinkingArticle | null; next: ThinkingArticle | null } {
  const pillar = entry.data.pillar as ThinkingPillar;
  const samePillar = all
    .filter((candidate) => candidate.data.pillar === pillar)
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
  const index = samePillar.findIndex((candidate) => candidate.id === entry.id);
  if (index === -1) {
    const chronological = [...all].sort(
      (a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf()
    );
    const globalIndex = chronological.findIndex((candidate) => candidate.id === entry.id);
    return {
      prev: globalIndex > 0 ? chronological[globalIndex - 1] : null,
      next:
        globalIndex >= 0 && globalIndex < chronological.length - 1
          ? chronological[globalIndex + 1]
          : null,
    };
  }
  return {
    prev: index > 0 ? samePillar[index - 1] : null,
    next: index < samePillar.length - 1 ? samePillar[index + 1] : null,
  };
}

export function getRelatedArticles(
  entry: ThinkingArticle,
  all: ThinkingArticle[]
): ThinkingArticle[] {
  const relatedIds = entry.data.relatedArticles ?? [];
  const byId = relatedIds
    .map((id) =>
      all.find(
        (candidate) =>
          candidate.id === id ||
          candidate.id === id ||
          candidate.id.endsWith(`/${id}.md`) ||
          candidate.id.endsWith(`/${id}`)
      )
    )
    .filter((candidate): candidate is ThinkingArticle => Boolean(candidate))
    .filter((candidate) => candidate.id !== entry.id);

  if (byId.length >= 3) return byId.slice(0, 4);

  const samePillar = all.filter(
    (candidate) =>
      candidate.id !== entry.id &&
      candidate.data.pillar === entry.data.pillar &&
      !byId.some((item) => item.id === candidate.id)
  );
  return [...byId, ...samePillar]
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 4);
}

export function getRelatedProjectSlugs(entry: ThinkingArticle): string[] {
  return entry.data.relatedProjects ?? [];
}

export function getCanonicalUrl(entry: ThinkingArticle, siteUrl: string): string {
  const lang = getArticleLanguage(entry);
  return `${siteUrl}${getArticlePath(getCanonicalSlug(entry), lang)}`;
}
