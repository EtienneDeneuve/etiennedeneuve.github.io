import type { CollectionEntry } from "astro:content";
import { isReleasedByPubDate } from "./publication-policy.ts";
import {
  getArticleLanguage,
  getArticlePath,
  getCanonicalSlug,
  type ThinkingArticle,
} from "./thinking.ts";

export type ContentReference = {
  kind: "article" | "project" | "resource";
  id: string;
};

export type ResolvedContent = {
  ref: ContentReference;
  title: string;
  description: string;
  href: string;
  kind: ContentReference["kind"];
  contentType?: string;
};

export type ContentCollections = {
  articles: ThinkingArticle[];
  projects: CollectionEntry<"projects">[];
  resources: CollectionEntry<"resources">[];
};

function normalizeContentId(id: string): string {
  return id
    .replace(/\.mdx?$/i, "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

function flattenContentId(id: string): string {
  return normalizeContentId(id).replace(/\//g, "-");
}

/** Drop date prefixes and common legacy prefixes so filename ↔ WP slug can match. */
function significantStem(id: string): string {
  return flattenContentId(id)
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/^(autofix|auto-fix)-/, "");
}

/** Compare Astro entry ids (often `2024/02/11/slug`) with filename refs (`2024-02-11-slug`). */
function matchesContentId(entryId: string, refId: string): boolean {
  const entry = normalizeContentId(entryId);
  const ref = normalizeContentId(refId);
  if (entry === ref) return true;

  const entryFlat = flattenContentId(entryId);
  const refFlat = flattenContentId(refId);
  if (entryFlat === refFlat) return true;
  if (entryFlat.endsWith(`-${refFlat}`) || refFlat.endsWith(`-${entryFlat}`)) return true;

  const entryTail = entry.split("/").pop() ?? entry;
  const refTail = ref.split("/").pop() ?? ref;
  if (entryTail === refTail) return true;

  const entryStem = significantStem(entryId);
  const refStem = significantStem(refId);
  if (
    entryStem &&
    refStem &&
    (entryStem === refStem || entryStem.includes(refStem) || refStem.includes(entryStem))
  ) {
    return true;
  }

  return false;
}

export function resolveContentRefs(
  refs: ContentReference[],
  collections: ContentCollections,
  lang: "fr" | "en"
): ResolvedContent[] {
  const prefix = lang === "en" ? "/en" : "";
  const resolved: ResolvedContent[] = [];

  for (const ref of refs) {
    if (ref.kind === "article") {
      const entry = collections.articles.find((article) => matchesContentId(article.id, ref.id));
      if (!entry || !isReleasedByPubDate(entry)) continue;
      resolved.push({
        ref,
        title: entry.data.title,
        description: entry.data.description,
        // Use the article's language: FR posts have no /en/thinking/ page.
        href: getArticlePath(getCanonicalSlug(entry), getArticleLanguage(entry)),
        kind: "article",
        contentType: entry.data.contentType,
      });
      continue;
    }

    if (ref.kind === "project") {
      const entry = collections.projects.find((project) => matchesContentId(project.id, ref.id));
      if (!entry || entry.data.draft) continue;
      const externalProof = entry.data.proofLinks[0] ?? entry.data.website ?? entry.data.repository;
      resolved.push({
        ref,
        title: entry.data.name,
        description: entry.data.summary,
        href: externalProof ?? `${prefix}/projects/${entry.id}/`,
        kind: "project",
      });
      continue;
    }

    const entry = collections.resources.find((resource) => matchesContentId(resource.id, ref.id));
    if (!entry) continue;
    resolved.push({
      ref,
      title: entry.data.title,
      description: entry.data.description,
      href: entry.data.url ?? entry.data.repository ?? "#",
      kind: "resource",
    });
  }

  return resolved;
}
