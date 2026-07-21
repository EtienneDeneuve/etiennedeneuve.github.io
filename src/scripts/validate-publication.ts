import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { runPublicationPolicyChecks } from "../lib/publication-policy.ts";

const ROOT = process.cwd();

function loadMarkdownCollection(name: string) {
  const dir = join(ROOT, "src/content", name);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => {
      const source = readFileSync(join(dir, file), "utf8");
      const parsed = matter(source);
      return {
        id: `${name}/${file.replace(/\.mdx?$/, "")}`,
        data: parsed.data as Record<string, unknown> & { draft?: boolean },
      };
    });
}

const collections = {
  blog: loadMarkdownCollection("blog"),
  caseStudies: loadMarkdownCollection("caseStudies").map((entry) => ({
    id: entry.id,
    data: normalizeCaseStudyFile(entry.data),
  })),
  projects: loadMarkdownCollection("projects"),
  appearances: loadMarkdownCollection("appearances"),
  resources: loadMarkdownCollection("resources"),
};

function normalizeCaseStudyFile(data: Record<string, unknown>) {
  const legacyMetrics = data.metrics;
  const legacyMetricArray =
    legacyMetrics && typeof legacyMetrics === "object"
      ? Object.entries(legacyMetrics as Record<string, unknown>).map(([label, value]) => ({
          label,
          before: "n/a",
          after: String(value ?? ""),
          unit: "text",
          source: "legacy-unverified",
          verified: false,
        }))
      : [];
  const legacyResults = Array.isArray(data.results)
    ? (data.results as unknown[]).map((item) => String(item))
    : [];

  const draftFromLegacy =
    legacyMetricArray.length > 0 && !legacyMetricArray.every((metric) => metric.verified);

  return {
    draft: draftFromLegacy || data.draft !== false ? true : false,
    outcomes: (data.outcomes as { summary: string; metrics: typeof legacyMetricArray }) ?? {
      summary: legacyResults.join(" "),
      metrics: legacyMetricArray,
    },
    evidence: (data.evidence as Array<string | Record<string, unknown>>) ?? [],
    results: legacyResults,
    workPerformed: Array.isArray(data.workPerformed)
      ? (data.workPerformed as string[])
      : data.approach
        ? [String(data.approach)]
        : legacyResults,
  };
}

const result = runPublicationPolicyChecks(collections);

for (const warning of result.warnings) {
  console.warn(`[warn] ${warning.path}: ${warning.message}`);
}

if (!result.ok) {
  for (const error of result.errors) {
    console.error(`[error] ${error.path}: ${error.message}`);
  }
  process.exit(1);
}

console.log("Publication policy: OK");
