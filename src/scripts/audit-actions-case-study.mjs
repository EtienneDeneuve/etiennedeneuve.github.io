#!/usr/bin/env node
/**
 * Reproducible GitHub Actions data collection for a private CI case study.
 *
 * Requires: Node >=22 or Bun, GitHub CLI (gh) authenticated with Actions read.
 * No network call or private repository URL is executed at import time.
 * Keep output JSON OUTSIDE the public repository.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_VERSION = "1.0.0";
const LIMIT = 1000;
const PER_PAGE = 100;
const CATEGORIES = ["docs-only", "backend", "frontend", "db", "rust", "shared/mixed"];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function dateMs(value) {
  const ms = Date.parse(value + "T00:00:00.000Z");
  invariant(/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(ms), "Invalid UTC day: " + value);
  invariant(new Date(ms).toISOString().startsWith(value), "Invalid calendar day: " + value);
  return ms;
}

function iso(ms) {
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

function checkWindow(start, end) {
  const a = dateMs(start);
  const b = dateMs(end);
  invariant(b > a, "end must be after start (exclusive)");
  return { a, b };
}

function apiPath(base, query) {
  const q = new URLSearchParams(query);
  return base + "?" + q.toString();
}

function ghApi(path) {
  let output;
  try {
    output = execFileSync("gh", ["api", "--method", "GET", path], {
      encoding: "utf8",
      timeout: 45000,
      maxBuffer: 20 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    throw new Error("gh api failed: " + String(error.stderr || error.message).slice(0, 400));
  }
  return JSON.parse(output);
}

function getPages(first, key, fetchPage) {
  const count = first.total_count;
  invariant(Number.isInteger(count) && count >= 0, "Missing " + key + " total_count");
  invariant(Array.isArray(first[key]), "Missing " + key + " array");
  const items = [...first[key]];
  const pages = Math.ceil(count / PER_PAGE);
  for (let page = 2; page <= pages; page++) {
    const next = fetchPage(page);
    invariant(Array.isArray(next[key]), "Missing page of " + key);
    items.push(...next[key]);
  }
  invariant(items.length === count, "Incomplete " + key + ": got " + items.length + " expected " + count);
  return items;
}

/**
 * Query one UTC time slice at a time. GitHub search caps filtered results at
 * 1000, even when total_count reports 1000: split BEFORE pagination reaches it.
 * Intervals are [start, end), with search upper bound inclusive at end - 1 s.
 */
export function collectRuns(repo, startMs, endMs, api, segments = []) {
  invariant(startMs % 1000 === 0 && endMs % 1000 === 0, "Windows must align on whole seconds");
  invariant(endMs > startMs, "Empty run search interval");
  const search = iso(startMs) + ".." + iso(endMs - 1000);
  const endpoint = "/repos/" + repo + "/actions/runs";
  const first = api(apiPath(endpoint, { created: search, per_page: PER_PAGE, page: 1 }));
  invariant(Number.isInteger(first.total_count), "GitHub did not return a total_count");
  if (first.total_count >= LIMIT) {
    const seconds = (endMs - startMs) / 1000;
    invariant(seconds > 1, "GitHub search still capped at one-second resolution: " + search);
    const midpoint = startMs + Math.floor(seconds / 2) * 1000;
    return [
      ...collectRuns(repo, startMs, midpoint, api, segments),
      ...collectRuns(repo, midpoint, endMs, api, segments),
    ];
  }
  const runs = getPages(first, "workflow_runs", (page) =>
    api(apiPath(endpoint, { created: search, per_page: PER_PAGE, page }))
  );
  // Enforce the count AND the search interval even when the API returns an unexpected item.
  for (const run of runs) {
    const time = Date.parse(run.created_at);
    invariant(Number.isFinite(time) && time >= startMs && time < endMs, "Run out of range: " + run.id);
    invariant(run.status === "completed", "Workflow run still active: " + run.id);
  }
  segments.push({
    from_inclusive: iso(startMs),
    to_exclusive: iso(endMs),
    expected: first.total_count,
    fetched: runs.length,
  });
  return runs;
}

function fetchRunJobs(repo, runId, api) {
  const endpoint = "/repos/" + repo + "/actions/runs/" + runId + "/jobs";
  const first = api(apiPath(endpoint, { filter: "all", per_page: PER_PAGE, page: 1 }));
  const count = first.total_count;
  invariant(Number.isInteger(count) && count >= 0, "Missing jobs total_count for run " + runId);
  const jobs = [...(first.jobs || [])];
  invariant(Array.isArray(first.jobs), "Missing jobs for run " + runId);
  for (let page = 2; page <= Math.ceil(count / PER_PAGE); page++) {
    const more = api(apiPath(endpoint, { filter: "all", per_page: PER_PAGE, page }));
    invariant(Array.isArray(more.jobs), "Missing jobs page for " + runId);
    jobs.push(...more.jobs);
  }
  invariant(jobs.length === count, "Incomplete jobs for run " + runId);
  invariant(jobs.every((j) => Number(j.run_id) === Number(runId)), "Cross-run job returned");
  return jobs;
}

export function jobMinutes(job) {
  if (job.conclusion === "skipped") return 0;
  invariant(job.status === "completed", "Job incomplete: " + job.id);
  // A cancellation before a runner starts is zero runner time.
  if (!job.started_at && job.conclusion === "cancelled") return 0;
  const from = Date.parse(job.started_at);
  const to = Date.parse(job.completed_at);
  invariant(Number.isFinite(from) && Number.isFinite(to), "Missing job timestamps: " + job.id);
  invariant(to >= from, "Negative job duration: " + job.id);
  return (to - from) / 60000;
}

export function summarize(snapshot) {
  invariant(snapshot.schema_version === 1 && snapshot.complete === true, "Incomplete or incompatible snapshot");
  const runById = new Map(snapshot.runs.map((r) => [Number(r.id), r]));
  invariant(runById.size === snapshot.runs.length, "Duplicate workflow run ID");
  const grouped = new Map();
  const counts = { runs: snapshot.runs.length, jobs: 0, started_jobs: 0, minutes: 0 };
  for (const job of snapshot.jobs) {
    const run = runById.get(Number(job.run_id));
    invariant(run, "Orphan job: " + job.id);
    const minutes = jobMinutes(job);
    counts.jobs++;
    counts.minutes += minutes;
    if (job.started_at) counts.started_jobs++;
    const key = run.event + " | " + run.name;
    const item = grouped.get(key) || { workflow_event: key, jobs: 0, minutes: 0 };
    item.jobs++;
    item.minutes += minutes;
    grouped.set(key, item);
  }
  return {
    window: snapshot.window,
    collected_at: snapshot.collected_at,
    counts,
    workflows: [...grouped.values()].sort((a, b) => b.minutes - a.minutes),
  };
}

function digest(snapshot) {
  return createHash("sha256")
    .update(JSON.stringify({
      segments: snapshot.segments,
      runs: snapshot.runs,
      jobs: snapshot.jobs,
    }))
    .digest("hex");
}

function readSnapshot(path) {
  const x = JSON.parse(readFileSync(path, "utf8"));
  invariant(x.complete === true && x.schema_version === 1, "Not a complete audit snapshot: " + path);
  invariant(Array.isArray(x.jobs) && Array.isArray(x.runs), "Snapshot has no runs/jobs");
  invariant(Array.isArray(x.segments), "Missing search segments");
  invariant(x.data_sha256 === digest(x), "Snapshot data hash mismatch: " + path);
  invariant(x.segments.every((s) => s.expected === s.fetched && s.expected < LIMIT), "Unverified search segment");
  const ids = new Set();
  for (const job of x.jobs) {
    invariant(!ids.has(job.id), "Duplicate job ID: " + job.id);
    ids.add(job.id);
  }
  return x;
}

function durationDays(snapshot) {
  const { a, b } = checkWindow(snapshot.window.start, snapshot.window.end);
  return (b - a) / 86400000;
}

export function compareSnapshots(before, after) {
  const db = durationDays(before);
  const da = durationDays(after);
  invariant(db === da, "Before/after windows must have identical durations");
  invariant(dateMs(before.window.end) <= dateMs(after.window.start), "Windows overlap");
  return {
    designation: "descriptive host-runner consumption, NOT a normalized CI benefit",
    equivalent_window_days: db,
    before: summarize(before),
    after: summarize(after),
    normalization: "not performed: requires complete PR inventory by change class",
    billing: "not measured: requires GitHub Billing detailed report",
    feedback_latency: "not measured: requires workstation + remote event timestamps",
  };
}

/**
 * A manually curated, auditable PR inventory. It MUST include PRs that generated
 * zero hosted actions. This tool cannot prove that the PR population is complete.
 */
export function normalizePullRequests(before, after, pre, post) {
  invariant(pre.population_verified === true && post.population_verified === true, "PR populations not attested complete");
  invariant(pre.quality_parity_verified === true && post.quality_parity_verified === true, "Check parity not verified");
  invariant(pre.source && post.source, "Missing PR inventory provenance");
  invariant(pre.window.start === before.window.start && pre.window.end === before.window.end, "Before manifest date mismatch");
  invariant(post.window.start === after.window.start && post.window.end === after.window.end, "After manifest date mismatch");

  function index(snapshot, manifest) {
    invariant(Array.isArray(manifest.pull_requests) && manifest.pull_requests.length > 0, "Empty PR inventory");
    const runById = new Map(snapshot.runs.map((r) => [Number(r.id), r]));
    const jobCost = new Map();
    for (const job of snapshot.jobs) {
      const id = Number(job.run_id);
      jobCost.set(id, (jobCost.get(id) || 0) + jobMinutes(job));
    }
    const results = new Map(CATEGORIES.map((category) => [category, { category, n: 0, minutes: 0 }]));
    const assignedRuns = new Set();
    const seenPrs = new Set();
    for (const pr of manifest.pull_requests) {
      invariant(Number.isInteger(pr.number) && pr.number > 0, "Bad PR number in inventory");
      invariant(!seenPrs.has(pr.number), "Duplicate PR in manifest: " + pr.number);
      seenPrs.add(pr.number);
      invariant(CATEGORIES.includes(pr.category), "Unknown PR category: " + pr.category);
      invariant(Array.isArray(pr.validation_run_ids), "PR missing validation_run_ids");
      const entry = results.get(pr.category);
      entry.n++;
      for (const idValue of pr.validation_run_ids) {
        const id = Number(idValue);
        invariant(!assignedRuns.has(id), "Hosted run assigned to multiple PRs: " + id);
        assignedRuns.add(id);
        const run = runById.get(id);
        invariant(run, "PR references run outside its snapshot: " + id);
        invariant(
          run.event === "pull_request" || run.event === "pull_request_target" || run.event === "push",
          "Non-PR validation run included: " + id
        );
        entry.minutes += jobCost.get(id) || 0;
      }
    }
    invariant(seenPrs.size === manifest.pull_requests.length, "Incomplete PR index");
    return results;
  }

  const a = index(before, pre);
  const b = index(after, post);
  const totalPre = [...a.values()].reduce((x, entry) => x + entry.n, 0);
  invariant(totalPre > 0, "No baseline PR classes");
  let standardizedBefore = 0;
  let standardizedAfter = 0;
  const strata = [];
  for (const category of CATEGORIES) {
    const beforeClass = a.get(category);
    const afterClass = b.get(category);
    if (beforeClass.n === 0 && afterClass.n === 0) continue;
    invariant(
      beforeClass.n > 0 && afterClass.n > 0,
      "Missing class in one period: " + category + " (cannot standardize)"
    );
    const weight = beforeClass.n / totalPre;
    const preMean = beforeClass.minutes / beforeClass.n;
    const postMean = afterClass.minutes / afterClass.n;
    standardizedBefore += weight * preMean;
    standardizedAfter += weight * postMean;
    strata.push({
      category,
      n_before: beforeClass.n,
      n_after: afterClass.n,
      fixed_baseline_weight: weight,
      hosted_minutes_per_pr_before: preMean,
      hosted_minutes_per_pr_after: postMean,
    });
  }
  invariant(standardizedBefore > 0, "No hosted baseline minutes to compare");
  return {
    designation: "conditionally standardized hosted validation minutes per eligible PR",
    conditions: "requires manually verified complete PR universes, mutually exclusive classification and quality parity",
    before_minutes_per_pr: standardizedBefore,
    after_minutes_per_pr: standardizedAfter,
    descriptive_change_pct: 100 * (standardizedAfter / standardizedBefore - 1),
    strata,
    note: "Not a causal effect, billable saving, feedback latency or developer productivity",
  };
}

function options(args) {
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    invariant(args[i]?.startsWith("--") && args[i + 1], "Expected --name value");
    opts[args[i].slice(2)] = args[i + 1];
  }
  return opts;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function saveJson(path, data) {
  const target = resolve(path);
  invariant(!existsSync(target), "Output exists; refusing overwrite: " + target);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(data, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  return target;
}

export function collectSnapshot(repo, start, end, api) {
  invariant(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo), "Invalid owner/repository");
  const { a, b } = checkWindow(start, end);
  const segments = [];
  const runs = collectRuns(repo, a, b, api, segments);
  const ids = new Set();
  for (const run of runs) {
    invariant(!ids.has(run.id), "Duplicate workflow run ID " + run.id);
    ids.add(run.id);
  }
  const jobs = [];
  const jobIds = new Set();
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    const fromRun = fetchRunJobs(repo, run.id, api);
    for (const job of fromRun) {
      invariant(!jobIds.has(job.id), "Duplicate workflow job ID " + job.id);
      jobIds.add(job.id);
      jobMinutes(job); // Reject incomplete or malformed job timestamps now.
      jobs.push({
        id: job.id,
        run_id: job.run_id,
        run_attempt: job.run_attempt,
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        started_at: job.started_at,
        completed_at: job.completed_at,
        labels: job.labels,
        runner_name: job.runner_name || null,
      });
    }
    if ((i + 1) % 25 === 0) process.stderr.write("Validated " + (i + 1) + "/" + runs.length + " runs\n");
  }
  const cleanedRuns = runs.map((run) => ({
    id: run.id,
    name: run.name,
    workflow_id: run.workflow_id,
    event: run.event,
    status: run.status,
    conclusion: run.conclusion,
    created_at: run.created_at,
    updated_at: run.updated_at,
    head_branch: run.head_branch,
    head_sha: run.head_sha,
    run_attempt: run.run_attempt,
  }));
  const snapshot = {
    schema_version: 1,
    script_version: SCRIPT_VERSION,
    complete: true,
    collected_at: new Date().toISOString(),
    repository: repo,
    window: { start, end, timezone: "UTC", end_exclusive: true, cohort: "workflow run created_at" },
    segments,
    runs: cleanedRuns,
    jobs,
  };
  snapshot.data_sha256 = digest(snapshot);
  summarize(snapshot);
  return snapshot;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const [cmd, ...other] = process.argv.slice(2);
    const p = options(other);
    if (cmd === "collect") {
      invariant(p.repo && p.start && p.end && p.out, "collect requires --repo --start --end --out");
      const data = collectSnapshot(p.repo, p.start, p.end, ghApi);
      process.stdout.write(JSON.stringify({
        output: saveJson(p.out, data),
        runs: data.runs.length,
        jobs: data.jobs.length,
        segments: data.segments.length,
        data_sha256: data.data_sha256,
      }, null, 2) + "\n");
    } else if (cmd === "compare") {
      invariant(p.before && p.after, "compare requires --before --after");
      process.stdout.write(JSON.stringify(
        compareSnapshots(readSnapshot(p.before), readSnapshot(p.after)), null, 2
      ) + "\n");
    } else if (cmd === "normalize") {
      invariant(p.before && p.after && p["prs-before"] && p["prs-after"],
        "normalize requires --before --after --prs-before --prs-after");
      const before = readSnapshot(p.before);
      const after = readSnapshot(p.after);
      compareSnapshots(before, after); // Fail on incompatible periods.
      process.stdout.write(JSON.stringify(normalizePullRequests(
        before, after, readJson(p["prs-before"]), readJson(p["prs-after"])
      ), null, 2) + "\n");
    } else {
      throw new Error("Usage: collect|compare|normalize; see docs/research/ci-locale-protocole-mesure-2026-10.md");
    }
  } catch (error) {
    console.error("Audit refused (fail closed): " + error.message);
    process.exitCode = 1;
  }
}
