import type { CollectionEntry } from "astro:content";
import { thinkingConfig, type ThinkingContentType } from "../config/thinking.ts";

export type HomeThinkingItem = {
  label: string;
  entry: CollectionEntry<"blog"> | CollectionEntry<"articles">;
};

const TYPE_ORDER: ThinkingContentType[] = [
  "doctrine",
  "field-note",
  "architecture-decision",
  "technical-guide",
];

/**
 * Up to four Thinking cards for the home: prefer one per content type,
 * then fill with the most recent released articles.
 */
export function selectHomeThinking(
  articles: Array<CollectionEntry<"blog"> | CollectionEntry<"articles">>,
  lang: "fr" | "en"
): HomeThinkingItem[] {
  const used = new Set<string>();
  const selected: HomeThinkingItem[] = [];

  for (const contentType of TYPE_ORDER) {
    const entry = articles.find((article) => {
      if (used.has(article.id)) return false;
      return (article.data.contentType ?? "technical-guide") === contentType;
    });
    if (!entry) continue;
    used.add(entry.id);
    selected.push({
      label: thinkingConfig.contentTypeLabels[contentType][lang],
      entry,
    });
  }

  for (const entry of articles) {
    if (selected.length >= 4) break;
    if (used.has(entry.id)) continue;
    used.add(entry.id);
    const contentType = (entry.data.contentType ?? "technical-guide") as ThinkingContentType;
    const label =
      thinkingConfig.contentTypeLabels[contentType]?.[lang] ??
      thinkingConfig.contentTypeLabels["technical-guide"][lang];
    selected.push({ label, entry });
  }

  return selected;
}
