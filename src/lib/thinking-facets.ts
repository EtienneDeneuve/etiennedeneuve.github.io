/**
 * Facet static paths must exist in both locales when either has articles,
 * so FR↔EN hreflang never points at a missing page. List content stays
 * locale-honest via articlesForLocale.
 */
import {
  articlesForLocale,
  getAllThinkingArticles,
  getEntryTags,
  getQualifyingTags,
  slugifyTag,
  type ThinkingArticle,
} from "./thinking.ts";
import {
  thinkingContentTypes,
  thinkingPillars,
  type ThinkingContentType,
  type ThinkingPillar,
} from "../config/thinking.ts";

export async function loadFacetCorpus(): Promise<{
  all: ThinkingArticle[];
  fr: ThinkingArticle[];
  en: ThinkingArticle[];
}> {
  const all = await getAllThinkingArticles();
  return {
    all,
    fr: articlesForLocale(all, "fr"),
    en: articlesForLocale(all, "en"),
  };
}

export function pillarFacetPaths(
  fr: ThinkingArticle[],
  en: ThinkingArticle[],
  locale: "fr" | "en"
) {
  return thinkingPillars
    .map((pillar) => {
      const frEntries = fr.filter((entry) => entry.data.pillar === pillar);
      const enEntries = en.filter((entry) => entry.data.pillar === pillar);
      if (frEntries.length === 0 && enEntries.length === 0) return null;
      return {
        params: { pillar },
        props: {
          pillar: pillar as ThinkingPillar,
          entries: locale === "en" ? enEntries : frEntries,
        },
      };
    })
    .filter((path): path is NonNullable<typeof path> => Boolean(path));
}

export function typeFacetPaths(fr: ThinkingArticle[], en: ThinkingArticle[], locale: "fr" | "en") {
  return thinkingContentTypes
    .map((type) => {
      const frEntries = fr.filter((entry) => entry.data.contentType === type);
      const enEntries = en.filter((entry) => entry.data.contentType === type);
      if (frEntries.length === 0 && enEntries.length === 0) return null;
      return {
        params: { type },
        props: {
          type: type as ThinkingContentType,
          entries: locale === "en" ? enEntries : frEntries,
        },
      };
    })
    .filter((path): path is NonNullable<typeof path> => Boolean(path));
}

export function tagFacetPaths(fr: ThinkingArticle[], en: ThinkingArticle[], locale: "fr" | "en") {
  const bySlug = new Map<string, { slug: string; label: string; count: number }>();
  for (const tag of [...getQualifyingTags(fr), ...getQualifyingTags(en)]) {
    const prev = bySlug.get(tag.slug);
    if (!prev || tag.count > prev.count) bySlug.set(tag.slug, tag);
  }
  const pool = locale === "en" ? en : fr;
  return [...bySlug.values()].map((tag) => ({
    params: { tag: tag.slug },
    props: {
      tag,
      entries: pool.filter((entry) =>
        getEntryTags(entry).some((label) => slugifyTag(label) === tag.slug)
      ),
    },
  }));
}
