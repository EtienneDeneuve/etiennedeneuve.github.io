import type { CollectionEntry } from "astro:content";
import { thinkingConfig, type ThinkingContentType } from "../config/thinking.ts";

export type HomeThinkingItem = {
  label: string;
  entry: CollectionEntry<"blog"> | CollectionEntry<"articles">;
  spotlight?: boolean;
};

const TYPE_ORDER: ThinkingContentType[] = [
  "doctrine",
  "field-note",
  "architecture-decision",
  "technical-guide",
];

/**
 * Up to four Thinking cards: a time-limited editorial spotlight if already
 * released, then distinct content types and the most recent released articles.
 */
export function selectHomeThinking(
  articles: Array<CollectionEntry<"blog"> | CollectionEntry<"articles">>,
  lang: "fr" | "en",
  now: Date = new Date()
): HomeThinkingItem[] {
  const used = new Set<string>();
  const selected: HomeThinkingItem[] = [];

  // Editorial spotlight for the Monday 12 October OpenTelemetry 2/4 share.
  // Expires at the Wednesday publication rebuild; never overrides release gating.
  const spotlightId = "2026-09-22-opentelemetry-instrumenter-200-services";
  const spotlightExpiresAt = Date.parse("2026-10-14T06:00:00.000Z");
  if (lang === "fr" && now.getTime() < spotlightExpiresAt) {
    const entry = articles.find((article) => article.id === spotlightId);
    if (entry) {
      used.add(entry.id);
      selected.push({
        label: thinkingConfig.contentTypeLabels["field-note"][lang],
        entry,
        spotlight: true,
      });
    }
  }

  for (const contentType of TYPE_ORDER) {
    if (selected.length >= 4) break;
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

/** Spotlight takes precedence over chronology, without duplicating a card. */
export function orderHomeThinking(items: HomeThinkingItem[]): HomeThinkingItem[] {
  return items
    .filter((item) => item.entry)
    .slice(0, 4)
    .sort(
      (a, b) =>
        Number(Boolean(b.spotlight)) - Number(Boolean(a.spotlight)) ||
        b.entry.data.pubDate.valueOf() - a.entry.data.pubDate.valueOf()
    );
}
