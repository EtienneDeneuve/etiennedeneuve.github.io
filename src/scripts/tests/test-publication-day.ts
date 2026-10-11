#!/usr/bin/env bun
/**
 * Publication is controlled by the French editorial date, independently of the
 * build runner timezone or the hour in pubDate.
 */
import assert from "node:assert/strict";
import type { CollectionEntry } from "astro:content";
import { orderHomeThinking, selectHomeThinking } from "../../lib/home-thinking.ts";
import { getReleasedArticles, isReleasedByPubDate } from "../../lib/publication-policy.ts";

const cases = [
  {
    name: "Friday article is released before 07:30 UTC on its Paris calendar day",
    now: "2026-10-09T06:32:00.000Z",
    pubDate: "2026-10-09T07:30:00.000Z",
    draft: false,
    expected: true,
  },
  {
    name: "Friday article stays hidden before midnight in Paris",
    now: "2026-10-08T21:59:59.000Z",
    pubDate: "2026-10-09T07:30:00.000Z",
    draft: false,
    expected: false,
  },
  {
    name: "French editorial Friday begins at 22:00 UTC in October (DST)",
    now: "2026-10-08T22:00:00.000Z",
    pubDate: "2026-10-09T07:30:00.000Z",
    draft: false,
    expected: true,
  },
  {
    name: "French editorial Friday begins at 23:00 UTC in November (standard time)",
    now: "2026-11-12T23:00:00.000Z",
    pubDate: "2026-11-13T07:30:00.000Z",
    draft: false,
    expected: true,
  },
  {
    name: "Saturday workstation article remains hidden on Friday",
    now: "2026-10-09T06:32:00.000Z",
    pubDate: "2026-10-10T07:30:00.000Z",
    draft: false,
    expected: false,
  },
  {
    name: "draft never publishes even after its date",
    now: "2026-10-09T06:32:00.000Z",
    pubDate: "2026-10-03T07:30:00.000Z",
    draft: true,
    expected: false,
  },
  {
    name: "invalid publication date is not public",
    now: "2026-10-09T06:32:00.000Z",
    pubDate: "not-a-date",
    draft: false,
    expected: false,
  },
] as const;

for (const item of cases) {
  const result = isReleasedByPubDate(
    { data: { draft: item.draft, pubDate: item.pubDate } },
    new Date(item.now)
  );
  assert.equal(result, item.expected, item.name);
}

const now = new Date("2026-10-09T06:32:00.000Z");
const entries = [
  { id: "current-ci", data: { draft: false, pubDate: "2026-10-09T07:30:00.000Z" } },
  { id: "tomorrow-mac", data: { draft: false, pubDate: "2026-10-10T07:30:00.000Z" } },
  { id: "future-ci", data: { draft: false, pubDate: "2026-10-16T07:30:00.000Z" } },
  { id: "hidden-draft", data: { draft: true, pubDate: "2026-10-03T07:30:00.000Z" } },
];
assert.deepEqual(
  getReleasedArticles(entries, now).map((entry) => entry.id),
  ["current-ci"]
);

console.log(`Publication-day checks passed: ${cases.length + 1}`);

// Spotlight selection tests: released OTel 2/4 leads during the Monday campaign,
// disappears after the Wednesday rebuild, and never creates a duplicate card.
const homeEntry = (id: string, contentType: string, pubDate: string) =>
  ({
    id,
    data: { draft: false, contentType, pubDate: new Date(pubDate) },
  }) as unknown as CollectionEntry<"blog">;

const homeCandidates = [
  homeEntry("recent-ci", "field-note", "2026-10-09T07:30:00.000Z"),
  homeEntry("mac-part-two", "architecture-decision", "2026-10-14T07:30:00.000Z"),
  homeEntry(
    "2026-09-22-opentelemetry-instrumenter-200-services",
    "field-note",
    "2026-09-22T21:30:00.000Z"
  ),
  homeEntry("doctrine", "doctrine", "2026-07-01T10:00:00.000Z"),
];

const monday = new Date("2026-10-12T08:00:00.000Z");
const mondayArticles = getReleasedArticles(homeCandidates, monday);
const mondayCards = orderHomeThinking(selectHomeThinking(mondayArticles, "fr", monday));
assert.equal(mondayCards[0].entry.id, "2026-09-22-opentelemetry-instrumenter-200-services");
assert.equal(mondayCards[0].spotlight, true);
assert.equal(new Set(mondayCards.map(({ entry }) => entry.id)).size, mondayCards.length);
assert.equal(
  mondayCards.some(({ entry }) => entry.id === "mac-part-two"),
  false
);

const wednesday = new Date("2026-10-14T06:00:00.000Z");
const wednesdayCards = orderHomeThinking(
  selectHomeThinking(getReleasedArticles(homeCandidates, wednesday), "fr", wednesday)
);
assert.equal(
  wednesdayCards.some((item) => item.spotlight),
  false
);
assert.equal(wednesdayCards[0].entry.id, "mac-part-two");

const mondayEnglish = selectHomeThinking(mondayArticles, "en", monday);
assert.equal(
  mondayEnglish.some((item) => item.spotlight),
  false
);
const noOtelCards = selectHomeThinking(
  mondayArticles.filter((entry) => !entry.id.includes("opentelemetry-instrumenter")),
  "fr",
  monday
);
assert.equal(
  noOtelCards.some((item) => item.spotlight),
  false
);
console.log("Spotlight selection tests passed: 6");
