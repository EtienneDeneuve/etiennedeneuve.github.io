import type { CollectionEntry } from "astro:content";
import type { ThinkingArticle } from "./thinking.ts";

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

function matchesContentId(entryId: string, refId: string): boolean {
  const normalizedEntryId = entryId.replace(/\.mdx?$/, "");
  const normalizedRefId = refId.replace(/\.mdx?$/, "");
  return (
    normalizedEntryId === normalizedRefId ||
    normalizedEntryId.endsWith(`/${normalizedRefId}`) ||
    normalizedEntryId.includes(normalizedRefId)
  );
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
      if (!entry) continue;
      resolved.push({
        ref,
        title: entry.data.title,
        description: entry.data.description,
        href: `${prefix}/thinking/${entry.id}/`,
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
