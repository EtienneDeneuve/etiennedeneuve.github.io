#!/usr/bin/env bun
/**
 * Publication is controlled by the French editorial date, independently of the
 * build runner timezone or the hour in pubDate.
 */
import assert from "node:assert/strict";
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
