import assert from "node:assert/strict";
import { checkEditorialLinks } from "../validate-editorial-links.mjs";

const docs = [
  {
    id: "2026-10-14-good-post",
    file: "good.md",
    title: "A proven example",
    language: "fr",
    relatedArticles: ["2026-10-28-related-post"],
    body: "Read [the article](/thinking/2026-10-28-related-post/).",
  },
  {
    id: "2026-10-28-related-post",
    file: "related.md",
    title: "Another example",
    language: "fr",
    relatedArticles: [],
    body: "",
  },
  {
    id: "2026-10-29-english-post-en",
    file: "en.md",
    title: "Another example",
    language: "en",
    relatedArticles: ["2026-10-14-good-post"],
    body: "See /en/thinking/2026-10-29-english-post-en/.",
  },
];
assert.deepEqual(checkEditorialLinks(docs), [], "valid cross-links and translated titles");

const future = {
  id: "2026-11-13-future-post",
  file: "future.md",
  title: "An upcoming issue",
  language: "fr",
  relatedArticles: ["2026-10-24-renamed-post"],
  body: "Bad [link](/thinking/2026-10-10-old-name/).",
};
const issues = checkEditorialLinks([...docs, future]);
assert.deepEqual(
  issues.map((issue) => issue.kind),
  ["missing-related", "missing-inline"],
  "future posts must fail before they become public"
);

const duplicate = {
  ...future,
  file: "duplicate.md",
  title: docs[0].title,
  body: "",
  relatedArticles: [],
};
assert(
  checkEditorialLinks([...docs, duplicate]).some((issue) => issue.kind === "duplicate-title"),
  "duplicate FR editorial titles must be rejected"
);
const legacy = { ...future, id: "2026-09-22-legacy", file: "legacy.md" };
assert.deepEqual(
  checkEditorialLinks([...docs, legacy]),
  [],
  "cutover date excludes legacy content"
);
console.log("Editorial source link checks passed");
