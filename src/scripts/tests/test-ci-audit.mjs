import assert from "node:assert/strict";
import {
  collectRuns,
  jobMinutes,
  normalizePullRequests,
  summarize,
} from "../audit-actions-case-study.mjs";

const a = Date.parse("2026-09-01T00:00:00Z");
const b = Date.parse("2026-09-02T00:00:00Z");
const midpoint = a + (b - a) / 2;

const calls = [];
const fake = (path) => {
  const url = new URL(path, "https://api.github.com");
  calls.push(url);
  const [from, to] = url.searchParams.get("created").split("..").map(Date.parse);
  const p = Number(url.searchParams.get("page"));
  assert.equal(url.searchParams.get("per_page"), "100");
  if (from === a && to === b - 1000) {
    return { total_count: 1000, workflow_runs: [] };
  }
  const firstHalf = to < midpoint;
  if (p !== 1) throw new Error("Unexpected second page in split test");
  return {
    total_count: 1,
    workflow_runs: [
      {
        id: firstHalf ? 1 : 2,
        created_at: new Date(firstHalf ? a : midpoint).toISOString(),
        status: "completed",
      },
    ],
  };
};

const segments = [];
const splitRuns = collectRuns("owner/repo", a, b, fake, segments);
assert.deepEqual(
  splitRuns.map((r) => r.id),
  [1, 2],
  "1000-result searches must split into complete, disjoint intervals"
);
assert.equal(segments.length, 2);
assert.equal(calls.length, 3);

const pageApi = (path) => {
  const url = new URL(path, "https://api.github.com");
  const page = Number(url.searchParams.get("page"));
  assert.equal(
    url.searchParams.get("created"),
    "2026-09-01T00:00:00Z..2026-09-01T23:59:59Z",
    "the second page must keep the search filter"
  );
  const firstPage = Array.from({ length: 100 }, (_, i) => ({
    id: 1000 + i,
    created_at: "2026-09-01T01:00:00Z",
    status: "completed",
  }));
  return {
    total_count: 101,
    workflow_runs:
      page === 1
        ? firstPage
        : [{ id: 2000, created_at: "2026-09-01T02:00:00Z", status: "completed" }],
  };
};
assert.equal(collectRuns("owner/repo", a, b, pageApi).length, 101);

assert.equal(
  jobMinutes({
    id: 1,
    conclusion: "success",
    status: "completed",
    started_at: "2026-09-01T01:00:00Z",
    completed_at: "2026-09-01T01:01:30Z",
  }),
  1.5
);
assert.equal(jobMinutes({ id: 2, conclusion: "skipped" }), 0);
assert.equal(jobMinutes({ id: 3, conclusion: "cancelled", status: "completed" }), 0);
assert.throws(() => jobMinutes({ id: 4, conclusion: "success", status: "completed" }));

function snapshot(start, end, runs, jobs) {
  return {
    schema_version: 1,
    complete: true,
    window: { start, end },
    runs,
    jobs,
  };
}
const before = snapshot(
  "2026-09-01",
  "2026-09-08",
  [
    { id: 10, name: "Tests", event: "pull_request" },
    { id: 11, name: "Tests", event: "pull_request" },
  ],
  [
    {
      id: 100,
      run_id: 10,
      status: "completed",
      conclusion: "success",
      started_at: "2026-09-02T10:00:00Z",
      completed_at: "2026-09-02T10:05:00Z",
    },
    {
      id: 101,
      run_id: 11,
      status: "completed",
      conclusion: "success",
      started_at: "2026-09-03T10:00:00Z",
      completed_at: "2026-09-03T10:01:00Z",
    },
  ]
);
const after = snapshot(
  "2026-09-08",
  "2026-09-15",
  [{ id: 12, name: "Tests", event: "pull_request" }],
  [
    {
      id: 102,
      run_id: 12,
      status: "completed",
      conclusion: "success",
      started_at: "2026-09-09T10:00:00Z",
      completed_at: "2026-09-09T10:02:00Z",
    },
  ]
);
assert.equal(summarize(before).counts.minutes, 6);
const manifest = (start, end, rows) => ({
  population_verified: true,
  quality_parity_verified: true,
  source: "Manual PR census with independent review",
  window: { start, end },
  pull_requests: rows,
});
const pre = manifest("2026-09-01", "2026-09-08", [
  { number: 1, category: "backend", validation_run_ids: [10] },
  { number: 2, category: "docs-only", validation_run_ids: [11] },
]);
const post = manifest("2026-09-08", "2026-09-15", [
  { number: 3, category: "backend", validation_run_ids: [12] },
  { number: 4, category: "docs-only", validation_run_ids: [] },
]);
const result = normalizePullRequests(before, after, pre, post);
assert.equal(result.before_minutes_per_pr, 3);
assert.equal(result.after_minutes_per_pr, 1);
assert.ok(result.descriptive_change_pct < -66 && result.descriptive_change_pct > -67);

const incomplete = { ...post, population_verified: false };
assert.throws(() => normalizePullRequests(before, after, pre, incomplete), /PR populations/);
const missingClass = {
  ...post,
  pull_requests: [{ number: 3, category: "backend", validation_run_ids: [12] }],
};
assert.throws(() => normalizePullRequests(before, after, pre, missingClass), /Missing class/);
const duplicateRuns = {
  ...post,
  pull_requests: [
    { number: 3, category: "backend", validation_run_ids: [12] },
    { number: 4, category: "docs-only", validation_run_ids: [12] },
  ],
};
assert.throws(() => normalizePullRequests(before, after, pre, duplicateRuns), /multiple PRs/);
console.log("CI audit: split, pagination, jobs, strata and refusal tests passed");
