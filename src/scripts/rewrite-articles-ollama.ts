#!/usr/bin/env bun
/**
 * Local pipeline: Kev triage + MLX/Ollama annotate/rewrite for legacy blog posts.
 * Never writes into src/content/blog/.
 *
 * Usage:
 *   bun run rewrite:articles -- status
 *   bun run rewrite:articles -- triage [--limit N] [--slug X] [--before YYYY-MM-DD]
 *   bun run rewrite:articles -- benchmark [--gold path] [--threshold 0.5]
 *   bun run rewrite:articles -- rewrite [--slug X] [--limit N] [--force]
 *   bun run rewrite:articles -- annotate --slug X [--force]
 *
 * Env:
 *   TRIAGE_BACKEND           kev | mlx | ollama   (default kev)
 *   KEV_BASE_URL             default http://127.0.0.1:8009
 *   KEV_MODEL                default jaredpalmer/kev-4b (label only; server loads weights)
 *   REWRITE_BACKEND          mlx | ollama   (default mlx)
 *   MLX_BASE_URL             default http://127.0.0.1:18080/v1
 *   TRIAGE_MODEL / REWRITE_MODEL
 *     mlx defaults:
 *       mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit (LLM triage fallback + rewrite)
 *     ollama fallbacks:
 *       qwen2.5:14b
 *   OLLAMA_HOST              default http://127.0.0.1:11434
 *   WORKLOG_ROOT             default ~/Worklog
 *
 * Prefer devenv scripts:
 *   kev-bootstrap | kev-serve | mlx-serve | rewrite-status | rewrite-triage | rewrite-draft
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import {
  assessBlogQuality,
  formatQualityForKevState,
  hardArchiveDecision,
  type BlogQuality,
} from "./lib/blog-quality.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const blogDir = join(rootDir, "src/content/blog");
const briefPath = join(rootDir, "docs/editorial-rewrite-prompt.md");

type RewriteBackend = "mlx" | "ollama";
type TriageBackend = "kev" | "mlx" | "ollama";

function parseTriageBackend(raw: string | undefined): TriageBackend {
  const v = (raw ?? "kev").toLowerCase();
  if (v === "mlx" || v === "ollama" || v === "kev") return v;
  return "kev";
}

const TRIAGE_BACKEND: TriageBackend = parseTriageBackend(process.env.TRIAGE_BACKEND);
const BACKEND: RewriteBackend =
  (process.env.REWRITE_BACKEND ?? "mlx").toLowerCase() === "ollama" ? "ollama" : "mlx";
const MLX_BASE_URL = (process.env.MLX_BASE_URL ?? "http://127.0.0.1:18080/v1").replace(/\/$/, "");
const OLLAMA_HOST = (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434").replace(/\/$/, "");
const KEV_BASE_URL = (process.env.KEV_BASE_URL ?? "http://127.0.0.1:8009").replace(/\/$/, "");
const KEV_MODEL = process.env.KEV_MODEL ?? "jaredpalmer/kev-4b";

const DEFAULT_REWRITE =
  BACKEND === "mlx" ? "mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit" : "qwen2.5:14b";
/** LLM triage fallback when TRIAGE_BACKEND is mlx/ollama. */
const DEFAULT_TRIAGE = BACKEND === "mlx" ? DEFAULT_REWRITE : "qwen2.5:14b";

const TRIAGE_MODEL = process.env.TRIAGE_MODEL ?? process.env.OLLAMA_TRIAGE_MODEL ?? DEFAULT_TRIAGE;
const REWRITE_MODEL =
  process.env.REWRITE_MODEL ?? process.env.OLLAMA_REWRITE_MODEL ?? DEFAULT_REWRITE;
const WORKLOG_ROOT = process.env.WORKLOG_ROOT ?? join(homedir(), "Worklog");

const rewritesRoot = join(WORKLOG_ROOT, "content/rewrites");
const statePath = join(rewritesRoot, "state.json");
const draftsDir = join(rewritesRoot, "drafts");
const triageDir = join(rewritesRoot, "triage");

type Decision = "archive" | "annotate" | "rewrite";

type TriageResult = {
  decision: Decision;
  pillar: string;
  contentType: string;
  angle: string;
  rationale: string;
  confidence: number;
  model: string;
  at: string;
};

type ArticleMeta = {
  file: string;
  slug: string;
  title: string;
  description: string;
  pubDate: string | null;
  year: number | null;
  tags: string[];
  contentType?: string;
  pillar?: string;
  draft: boolean;
  wordCount: number;
  path: string;
};

type StateFile = {
  version: 1;
  updatedAt: string;
  articles: Record<
    string,
    {
      sourceFile: string;
      triage?: TriageResult;
      draftPath?: string;
      status: "pending" | "triaged" | "drafted" | "skipped";
    }
  >;
};

const PILLARS = [
  "systems-and-risk",
  "platform-engineering",
  "cloud-and-infrastructure",
  "software-supply-chain",
  "observability",
  "product-and-markets",
  "technical-leadership",
] as const;

const CONTENT_TYPES = [
  "doctrine",
  "field-note",
  "architecture-decision",
  "technical-guide",
  "opinion",
  "case-analysis",
] as const;

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const command = args.find((a) => !a.startsWith("-")) ?? "status";
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const has = (flag: string) => args.includes(flag);
  return {
    command,
    slug: get("--slug"),
    limit: get("--limit") ? Number(get("--limit")) : undefined,
    before: get("--before") ?? "2024-01-01",
    force: has("--force"),
    dryRun: has("--dry-run"),
    model: get("--model"),
    gold: get("--gold") ?? join(rootDir, "evals/triage-gold-v1.json"),
    threshold: get("--threshold") ? Number(get("--threshold")) : 0.5,
  };
}

type GoldLabel = {
  slug: string;
  decision: Decision;
  note?: string;
};

type GoldFile = {
  version: number;
  name: string;
  labels: GoldLabel[];
};

function ensureDirs() {
  for (const dir of [rewritesRoot, draftsDir, triageDir]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

function loadState(): StateFile {
  ensureDirs();
  if (!existsSync(statePath)) {
    return { version: 1, updatedAt: new Date().toISOString(), articles: {} };
  }
  return JSON.parse(readFileSync(statePath, "utf8")) as StateFile;
}

function saveState(state: StateFile) {
  ensureDirs();
  state.updatedAt = new Date().toISOString();
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function loadBrief(): string {
  if (!existsSync(briefPath)) {
    throw new Error(`Missing brief: ${briefPath}`);
  }
  return readFileSync(briefPath, "utf8");
}

function wordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

function loadArticles(): ArticleMeta[] {
  return readdirSync(blogDir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .map((file) => {
      const path = join(blogDir, file);
      const raw = readFileSync(path, "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.mdx?$/, "");
      let pubDate: string | null = null;
      let year: number | null = null;
      if (data.pubDate) {
        const d = new Date(data.pubDate);
        if (!Number.isNaN(d.getTime())) {
          pubDate = d.toISOString();
          year = d.getUTCFullYear();
        }
      } else {
        const m = slug.match(/^(\d{4})-/);
        if (m) year = Number(m[1]);
      }
      return {
        file,
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        pubDate,
        year,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        contentType: data.contentType ? String(data.contentType) : undefined,
        pillar: data.pillar ? String(data.pillar) : undefined,
        draft: Boolean(data.draft),
        wordCount: wordCount(content),
        path,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function beforeCutoff(article: ArticleMeta, before: string): boolean {
  const cutoff = new Date(before);
  if (Number.isNaN(cutoff.getTime())) {
    throw new Error(`Invalid --before date: ${before}`);
  }
  if (article.pubDate) {
    return new Date(article.pubDate) < cutoff;
  }
  if (article.year != null) {
    return article.year < cutoff.getUTCFullYear();
  }
  return true;
}

function selectArticles(
  all: ArticleMeta[],
  opts: { slug?: string; before: string; limit?: number }
): ArticleMeta[] {
  let list = all;
  if (opts.slug) {
    list = list.filter((a) => a.slug === opts.slug || a.file === opts.slug);
    if (list.length === 0) throw new Error(`Article not found: ${opts.slug}`);
    return list;
  }
  list = list.filter((a) => beforeCutoff(a, opts.before));
  if (opts.limit != null && opts.limit > 0) list = list.slice(0, opts.limit);
  return list;
}

async function kevReady(): Promise<void> {
  try {
    const res = await fetch(`${KEV_BASE_URL}/v1/models`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(
      `Kev server unreachable at ${KEV_BASE_URL}.
From devenv: kev-bootstrap && kev-serve
Or: TRIAGE_BACKEND=mlx with mlx-serve
(${String(err)})`
    );
  }
}

async function llmReady(): Promise<void> {
  if (BACKEND === "mlx") {
    try {
      const res = await fetch(`${MLX_BASE_URL}/models`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      throw new Error(
        `MLX server unreachable at ${MLX_BASE_URL}.
Start MoE OptiQ (M2 Max 64GB sweet spot):
  uvx --from mlx-lm mlx_lm.server \\
    --model mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit --port 18080

Or fall back: REWRITE_BACKEND=ollama && ollama pull qwen3.5:35b-a3b
(${String(err)})`
      );
    }
    return;
  }
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(
      `Ollama unreachable at ${OLLAMA_HOST}. Start with: ollama serve\n(${String(err)})`
    );
  }
}

async function triageReady(): Promise<void> {
  if (TRIAGE_BACKEND === "kev") {
    await kevReady();
    return;
  }
  await llmReady();
}

type KevChoiceAnswer = {
  type?: string;
  choice?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
};

type KevNoulAnswer = {
  type?: string;
  noul?: number;
};

type KevSystemOneResponse = {
  model?: string;
  answers?: {
    decision?: KevChoiceAnswer;
    pillar?: KevChoiceAnswer;
    contentType?: KevChoiceAnswer;
    is_dead_tutorial?: KevNoulAnswer;
    has_doctrine_judgment?: KevNoulAnswer;
    deserves_dense_note?: KevNoulAnswer;
  };
};

const PILLAR_CRITERIA: Record<(typeof PILLARS)[number], string> = {
  "systems-and-risk": "Risk, security posture, Zero Trust, governance of complex systems",
  "platform-engineering": "Platform, GitOps, workstations, developer platforms, Nix, MDM",
  "cloud-and-infrastructure": "Cloud providers, IaC, networking, ops tooling, Azure/AWS",
  "software-supply-chain": "Scanning, SBOM, vulnerabilities, secure delivery of software",
  observability: "OpenTelemetry, metrics, logs, traces, monitoring contracts",
  "product-and-markets": "Products, markets, frameworks, web tooling, ISV journeys",
  "technical-leadership": "Leadership, MVP, community, career, speaking, mentoring",
};

const CONTENT_TYPE_CRITERIA: Record<(typeof CONTENT_TYPES)[number], string> = {
  doctrine: "Principles and lasting judgment about how systems should be built",
  "field-note": "Concrete field experience, what broke, what was learned",
  "architecture-decision": "A decision with trade-offs and consequences",
  "technical-guide": "How-to, tutorial, step-by-step tooling instructions",
  opinion: "Personal stance without a full architecture frame",
  "case-analysis": "Analysis of a vendor, product, or case study",
};

function buildKevState(article: ArticleMeta, quality?: BlogQuality): string {
  const source = readFileSync(article.path, "utf8");
  const { content } = matter(source);
  const body = content.trim().slice(0, 7000);
  const year = article.year ?? "unknown";
  const q = quality ?? assessBlogQuality(article);
  return [
    `slug: ${article.slug}`,
    `title: ${article.title}`,
    `description: ${article.description || "(none)"}`,
    `pubDate: ${article.pubDate ?? year}`,
    `year: ${year}`,
    `wordCount: ${article.wordCount}`,
    `tags: ${article.tags.join(", ") || "(none)"}`,
    `draft: ${article.draft}`,
    `existingPillar: ${article.pillar ?? "(none)"}`,
    `existingContentType: ${article.contentType ?? "(none)"}`,
    `context: Legacy post under review for a 2026 doctrine hub. Year=${year}.`,
    formatQualityForKevState(q),
    "",
    "--- body ---",
    body,
  ].join("\n");
}

async function postKevSystemOne(
  state: string,
  questions: Record<string, unknown>
): Promise<KevSystemOneResponse> {
  const res = await fetch(`${KEV_BASE_URL}/v1/systemone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state,
      model: "kev-latest",
      questions,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kev systemone failed (${res.status}): ${body.slice(0, 500)}`);
  }
  return (await res.json()) as KevSystemOneResponse;
}

async function triageOneKev(article: ArticleMeta): Promise<TriageResult> {
  const quality = assessBlogQuality(article);
  const hard = hardArchiveDecision(quality);
  if (hard) {
    return {
      decision: "archive",
      pillar: quality.doctrineTopicHit
        ? normalizePillar(article.pillar ?? "systems-and-risk")
        : article.pillar && (PILLARS as readonly string[]).includes(article.pillar)
          ? article.pillar
          : quality.looksLikePersonal
            ? "technical-leadership"
            : "cloud-and-infrastructure",
      contentType: quality.looksLikeHowTo ? "technical-guide" : "opinion",
      angle: `Hard archive · ${hard.reason}`,
      rationale: `Mechanical/quality rule: ${hard.reason}. ${quality.summaryLine}`,
      confidence: hard.confidence,
      model: `rules+${KEV_MODEL}`,
      at: new Date().toISOString(),
    };
  }

  const state = buildKevState(article, quality);
  const json = await postKevSystemOne(state, {
    decision: {
      type: "choice",
      instructions: [
        "Editorial triage for etienne.deneuve.xyz, a doctrine/proof hub for CTO, platform and SRE leads.",
        "Use the qualitySummary / qualityFlags / mechanicalHints lines as strong priors.",
        "If deadStack=true and howTo=true on an old post, prefer archive.",
        "If offTopic=true without doctrineTopic, prefer archive.",
        "Pick exactly one action. Prefer annotate over rewrite unless has lasting architecture trade-off.",
        "rewrite is rare.",
      ].join(" "),
      criteria: {
        archive: [
          "Do not invest. Toy scripts, personal announcements, dead products (SCCM, Vorlon, OMS-only, old Windows admin), printer/gadget tips,",
          "broken link farms, or off-topic surveys (web frameworks, LinkedIn carousels) with no lasting systems judgment.",
          "Also archive step-by-step tutorials whose stack or UI no longer exists and that teach no reusable principle.",
        ].join(" "),
        annotate: [
          "Keep the body. Add only a short 2026 note.",
          "Use when a technical idea is still roughly true (Git for ops, docs-as-code, Ansible/Azure, Terraform basics, MegaLinter, Zero Trust overview)",
          "but the packaging is outdated and the piece is NOT a core doctrine decision for the current positioning.",
          "Historical how-tos that still teach a useful practice belong here, not in rewrite.",
        ].join(" "),
        rewrite: [
          "Invest in a denser 2026 note (300-450 words of judgment), still keeping the original body lightly copyedited.",
          "Only if the article already argues a lasting trade-off on identity, RBAC, platform engineering, GitOps, observability contracts,",
          "or systems risk that still shapes how CTOs should decide today.",
          "Do not pick rewrite merely because the topic is cloud, Terraform, or Azure.",
        ].join(" "),
      },
    },
    is_dead_tutorial: {
      type: "noul",
      instructions:
        "Is this primarily an outdated how-to on a dead or obsolete stack with little reusable doctrine?",
    },
    has_doctrine_judgment: {
      type: "noul",
      instructions:
        "Does the article already argue a lasting architecture or identity/platform trade-off useful to a CTO today (not just steps to click)?",
    },
    pillar: {
      type: "choice",
      instructions: "Which Thinking pillar best fits this article?",
      criteria: PILLAR_CRITERIA,
    },
    contentType: {
      type: "choice",
      instructions: "Which Thinking content type best fits this article?",
      criteria: CONTENT_TYPE_CRITERIA,
    },
  });

  let decision = normalizeDecision(String(json.answers?.decision?.choice ?? ""));
  const pillar = normalizePillar(String(json.answers?.pillar?.choice ?? ""));
  const contentType = normalizeContentType(String(json.answers?.contentType?.choice ?? ""));
  let confidence = Math.min(1, Math.max(0, Number(json.answers?.decision?.confidence ?? 0.5)));
  const deadP = Number(json.answers?.is_dead_tutorial?.noul ?? 0);
  const doctrineP = Number(json.answers?.has_doctrine_judgment?.noul ?? 0);

  // Post-process with Kev quality nouls + mechanical priors.
  if (deadP >= 0.55 && doctrineP < 0.45 && !quality.salvageableTopicHit && decision !== "archive") {
    decision = "archive";
    confidence = Math.max(confidence, deadP);
  } else if (
    decision === "archive" &&
    (doctrineP >= 0.65 || quality.salvageableTopicHit) &&
    deadP < 0.4
  ) {
    decision = "annotate";
    confidence = Math.max(confidence, Math.max(doctrineP, 0.55));
  } else if (
    decision === "archive" &&
    quality.salvageableTopicHit &&
    !quality.deadStackHit &&
    confidence < 0.7
  ) {
    decision = "annotate";
    confidence = Math.max(confidence, 0.55);
  }

  if (
    decision === "annotate" &&
    (doctrineP >= 0.45 || quality.doctrineTopicHit || quality.salvageableTopicHit)
  ) {
    const pass2 = await postKevSystemOne(state, {
      deserves_dense_note: {
        type: "noul",
        instructions: [
          "Should this get a denser 2026 doctrine note (rewrite) rather than a short annotate?",
          "Yes only if it already contains lasting judgment on identity, RBAC, platform, GitOps, observability, or systems risk.",
          "No for ordinary how-tos even if still somewhat useful.",
        ].join(" "),
      },
    });
    const dense = Number(pass2.answers?.deserves_dense_note?.noul ?? 0);
    const denseCut = quality.doctrineTopicHit ? 0.4 : 0.55;
    if (dense >= denseCut) {
      decision = "rewrite";
      confidence = Math.max(confidence, dense);
    }
  }

  // Mechanical off-topic / dead how-to override when Kev is unsure.
  if (
    decision !== "archive" &&
    confidence < 0.45 &&
    !quality.salvageableTopicHit &&
    !quality.doctrineTopicHit &&
    ((quality.deadStackHit && quality.looksLikeHowTo) || quality.looksLikeOffTopic)
  ) {
    decision = "archive";
    confidence = Math.max(confidence, 0.7);
  }

  const probs = json.answers?.decision?.probabilities;
  const topProb = probs && typeof probs[decision] === "number" ? probs[decision] : confidence;

  return {
    decision,
    pillar,
    contentType,
    angle: `Kev ${decision} · ${pillar} · ${contentType}`,
    rationale: `Kev triage: ${decision} (p=${topProb.toFixed(2)}, conf=${confidence.toFixed(2)}, dead=${deadP.toFixed(2)}, doctrine=${doctrineP.toFixed(2)}). ${quality.summaryLine}`,
    confidence,
    model: json.model ?? KEV_MODEL,
    at: new Date().toISOString(),
  };
}

async function chatLlm(model: string, system: string, user: string): Promise<string> {
  if (BACKEND === "mlx") {
    const res = await fetch(`${MLX_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`MLX chat failed (${res.status}): ${body.slice(0, 500)}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty MLX response");
    return content;
  }

  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      options: { temperature: 0.3 },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama chat failed (${res.status}): ${body.slice(0, 500)}`);
  }
  const json = (await res.json()) as { message?: { content?: string } };
  const content = json.message?.content?.trim();
  if (!content) throw new Error("Empty Ollama response");
  return content;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start)
    throw new Error(`No JSON object in model output:\n${text.slice(0, 400)}`);
  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeDecision(raw: string): Decision {
  const d = raw.toLowerCase().trim();
  if (d === "archive" || d === "annotate" || d === "rewrite") return d;
  throw new Error(`Invalid decision: ${raw}`);
}

function normalizePillar(raw: string): string {
  const p = raw.trim();
  if ((PILLARS as readonly string[]).includes(p)) return p;
  return "cloud-and-infrastructure";
}

function normalizeContentType(raw: string): string {
  const c = raw.trim();
  if ((CONTENT_TYPES as readonly string[]).includes(c)) return c;
  return "technical-guide";
}

async function triageOneLlm(
  article: ArticleMeta,
  brief: string,
  model: string
): Promise<TriageResult> {
  const source = readFileSync(article.path, "utf8");
  const system = `${brief}

Tu es en mode TRIAGE uniquement.
Réponds avec un seul objet JSON (pas de markdown) de la forme:
{
  "decision": "archive" | "annotate" | "rewrite",
  "pillar": "<pillar enum>",
  "contentType": "<contentType enum>",
  "angle": "une phrase — angle 2026 si rewrite/annotate",
  "rationale": "2-3 phrases max",
  "confidence": 0.0-1.0
}`;

  const user = `ARTICLE_SLUG: ${article.slug}
TITLE: ${article.title}
PUB_DATE: ${article.pubDate ?? article.year ?? "unknown"}
WORD_COUNT: ${article.wordCount}
TAGS: ${article.tags.join(", ") || "(none)"}

---SOURCE---
${source.slice(0, 14000)}
---END---`;

  const raw = await chatLlm(model, system, user);
  const parsed = extractJson(raw) as Record<string, unknown>;
  return {
    decision: normalizeDecision(String(parsed.decision ?? "")),
    pillar: normalizePillar(String(parsed.pillar ?? "")),
    contentType: normalizeContentType(String(parsed.contentType ?? "")),
    angle: String(parsed.angle ?? "").trim() || "(no angle)",
    rationale: String(parsed.rationale ?? "").trim() || "(no rationale)",
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.5))),
    model,
    at: new Date().toISOString(),
  };
}

async function triageOne(
  article: ArticleMeta,
  brief: string,
  model: string
): Promise<TriageResult> {
  if (TRIAGE_BACKEND === "kev") {
    return triageOneKev(article);
  }
  return triageOneLlm(article, brief, model);
}

function sanitizeVoice(text: string): string {
  return text
    .replace(/\u2014/g, ",") // em dash —
    .replace(/\u2013/g, ",") // en dash –
    .replace(/\s+,/g, ",")
    .replace(/,{2,}/g, ",")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

const AUDIENCES = [
  "cto-cio-ciso",
  "engineering-leads",
  "engineers",
  "partners",
  "media",
  "general",
] as const;

function normalizeAudience(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw.map(String) : String(raw ?? "").split(/[\s,]+/);
  const out = list.map((a) => a.trim()).filter((a) => (AUDIENCES as readonly string[]).includes(a));
  return out.length > 0 ? out : ["engineering-leads", "engineers"];
}

function normalizeTags(raw: unknown, fallback: string[]): string[] {
  const list = Array.isArray(raw) ? raw.map(String) : fallback;
  return [...new Set(list.map((t) => t.trim()).filter(Boolean))].slice(0, 6);
}

type EnrichPayload = {
  description: string;
  contentType: string;
  pillar: string;
  audience: string[];
  tags: string[];
  note: string;
};

function parseEnrichPayload(text: string): EnrichPayload {
  const parsed = extractJson(text) as Record<string, unknown>;
  return {
    description: String(parsed.description ?? "").trim(),
    contentType: normalizeContentType(String(parsed.contentType ?? "")),
    pillar: normalizePillar(String(parsed.pillar ?? "")),
    audience: normalizeAudience(parsed.audience),
    tags: normalizeTags(parsed.tags, []),
    note: sanitizeVoice(String(parsed.note ?? "").trim()),
  };
}

/** Deterministic safe formatting (no semantic change). */
function normalizeMarkdownFormat(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/\u00a0/g, " ")
    .trim();
}

/**
 * Accept LLM body only if it looks like a light copyedit, not a rewrite.
 * Falls back to original when the model drifts.
 */
function acceptLightCopyedit(original: string, candidate: string): string {
  const o = normalizeMarkdownFormat(original);
  let c = candidate.trim();
  if (c.startsWith("---")) {
    const end = c.indexOf("\n---", 3);
    if (end > 0) c = c.slice(end + 4).trim();
  }
  const fenced = c.match(/^```(?:markdown|md)?\s*([\s\S]*?)```\s*$/);
  if (fenced) c = fenced[1].trim();
  c = normalizeMarkdownFormat(c);

  if (c.length < 80) return o;
  const ratio = c.length / Math.max(o.length, 1);
  if (ratio < 0.88 || ratio > 1.12) {
    console.warn("  copyedit rejected: length drift");
    return o;
  }
  const oHeadings = (o.match(/^#{1,6}\s/gm) ?? []).length;
  const cHeadings = (c.match(/^#{1,6}\s/gm) ?? []).length;
  if (Math.abs(oHeadings - cHeadings) > 1) {
    console.warn("  copyedit rejected: heading drift");
    return o;
  }
  const oFences = (o.match(/```/g) ?? []).length;
  const cFences = (c.match(/```/g) ?? []).length;
  if (oFences !== cFences) {
    console.warn("  copyedit rejected: code-fence drift");
    return o;
  }
  return sanitizeVoice(c);
}

function assembleEnrichedDraft(
  article: ArticleMeta,
  triage: TriageResult | undefined,
  enrich: EnrichPayload,
  body: string
): string {
  const sourceRaw = readFileSync(article.path, "utf8");
  const { data: srcFm } = matter(sourceRaw);
  const today = new Date().toISOString();

  if (!enrich.note || enrich.note.length < 40) {
    throw new Error(`Empty or too-short relecture note for ${article.slug}`);
  }

  // Permalink safety: never let the model change title or legacy slug.
  const title = String(srcFm.title ?? article.title);
  const fm: Record<string, unknown> = {
    title,
    description: article.description || enrich.description || triage?.angle || "Draft a relire",
    pubDate: article.pubDate ?? srcFm.pubDate ?? today,
    lastModified: today,
    updateDate: today,
    language: srcFm.language ?? "fr",
    contentType: enrich.contentType || triage?.contentType || "field-note",
    pillar: enrich.pillar || triage?.pillar || "cloud-and-infrastructure",
    audience: enrich.audience,
    tags: enrich.tags.length > 0 ? enrich.tags : article.tags.slice(0, 6),
    featured: false,
    draft: true,
    relatedProjects: Array.isArray(srcFm.relatedProjects) ? srcFm.relatedProjects : [],
    relatedArticles: Array.isArray(srcFm.relatedArticles) ? srcFm.relatedArticles : [],
  };
  if (typeof srcFm.slug === "string" && srcFm.slug.trim()) {
    fm.slug = srcFm.slug;
  }
  if (typeof srcFm.img === "string") fm.img = srcFm.img;
  if (typeof srcFm.img_alt === "string") fm.img_alt = srcFm.img_alt;
  if (typeof srcFm.imgAlt === "string") fm.imgAlt = srcFm.imgAlt;

  const note = enrich.note.startsWith("**Relecture")
    ? enrich.note
    : `**Relecture 2026.** ${enrich.note}`;

  const assembled = [
    note,
    "",
    "## Article d'origine",
    "",
    "> Texte d'époque conservé. Orthographe et formatage éventuellement normalisés à la marge ; le fond et le titre restent ceux de la publication initiale.",
    "",
    body.trim(),
    "",
  ].join("\n");

  return matter.stringify(assembled, fm);
}

async function lightCopyeditBody(
  article: ArticleMeta,
  brief: string,
  model: string,
  originalBody: string
): Promise<string> {
  const normalized = normalizeMarkdownFormat(originalBody);
  if (normalized.split(/\s+/).length < 80) return normalized;

  const system = `${brief}

Tu es en mode COPYEDIT LEGER uniquement.
Corrige UNIQUEMENT: orthographe, accents, espaces, fences markdown mal fermees, typos evidents.
INTERDIT: reformuler, resumer, moderniser le fond, changer titres, liens, URLs, noms, code.
INTERDIT: ajouter une note 2026, un preambule, des commentaires.
INTERDIT: tirets cadratin.
Sortie: le corps markdown COMPLET uniquement (pas de JSON, pas de frontmatter).`;

  const user = `TITLE (ne pas modifier, ne pas renvoyer): ${article.title}
SLUG: ${article.slug}

---BODY---
${normalized.slice(0, 14000)}
---END---`;

  try {
    const raw = await chatLlm(model, system, user);
    return acceptLightCopyedit(normalized, raw);
  } catch (err) {
    console.warn(`  copyedit skipped: ${String(err)}`);
    return normalized;
  }
}

async function rewriteOne(
  article: ArticleMeta,
  brief: string,
  model: string,
  mode: "rewrite" | "annotate",
  triage?: TriageResult
): Promise<string> {
  const source = readFileSync(article.path, "utf8");
  const { content: originalBody } = matter(source);
  const wordTarget = mode === "rewrite" ? "300 a 450 mots" : "150 a 250 mots";

  const system = `${brief}

Tu es en mode ${mode.toUpperCase()}.
Reponds avec UN objet JSON strict (pas de markdown autour), champs:
description, contentType, pillar, audience, tags, note.
NE RENVOIE PAS de title (le titre original est conserve pour les permalinks).
NE RENVOIE PAS le corps de l'article.
La note fait ${wordTarget}, prose continue, sans tirets cadratin.
Pilier suggere: ${triage?.pillar ?? "cloud-and-infrastructure"}
Type suggere: ${triage?.contentType ?? "field-note"}
Angle: ${triage?.angle ?? "(deriver de la source)"}`;

  const user = `ARTICLE_SLUG: ${article.slug}
TITLE (immutable): ${article.title}
PUB_DATE: ${article.pubDate ?? article.year ?? "unknown"}

---SOURCE (contexte; ne pas recopier dans note)---
${source.slice(0, 10000)}
---END---`;

  const raw = await chatLlm(model, system, user);
  const enrich = parseEnrichPayload(raw);
  if (enrich.tags.length === 0) enrich.tags = article.tags.slice(0, 6);

  console.log(`  copyedit body: ${article.slug} …`);
  const body = await lightCopyeditBody(article, brief, model, originalBody);
  return assembleEnrichedDraft(article, triage, enrich, body);
}

function cmdStatus(all: ArticleMeta[], state: StateFile, before: string) {
  const legacy = all.filter((a) => beforeCutoff(a, before));
  const modern = all.filter((a) => !beforeCutoff(a, before));
  const counts = { pending: 0, triaged: 0, drafted: 0, skipped: 0 };
  const byDecision: Record<string, number> = { archive: 0, annotate: 0, rewrite: 0, none: 0 };

  for (const a of legacy) {
    const entry = state.articles[a.slug];
    const st = entry?.status ?? "pending";
    counts[st] = (counts[st] ?? 0) + 1;
    const d = entry?.triage?.decision;
    byDecision[d ?? "none"] = (byDecision[d ?? "none"] ?? 0) + 1;
  }

  console.log(`Worklog rewrites: ${rewritesRoot}`);
  console.log(`State: ${statePath}`);
  if (TRIAGE_BACKEND === "kev") {
    console.log(`Triage backend: kev @ ${KEV_BASE_URL} (model=${KEV_MODEL})`);
  } else if (TRIAGE_BACKEND === "ollama") {
    console.log(`Triage backend: ollama @ ${OLLAMA_HOST} (model=${TRIAGE_MODEL})`);
  } else {
    console.log(`Triage backend: mlx @ ${MLX_BASE_URL} (model=${TRIAGE_MODEL})`);
  }
  console.log(
    BACKEND === "mlx"
      ? `Rewrite backend: mlx @ ${MLX_BASE_URL} (model=${REWRITE_MODEL})`
      : `Rewrite backend: ollama @ ${OLLAMA_HOST} (model=${REWRITE_MODEL})`
  );
  console.log(`Cutoff --before ${before}`);
  console.log(
    `Blog total: ${all.length}  |  legacy: ${legacy.length}  |  modern: ${modern.length}`
  );
  console.log(`Legacy status:`, counts);
  console.log(`Legacy decisions:`, byDecision);
  console.log("");
  console.log("Next rewrite candidates (decision=rewrite, not drafted):");
  const candidates = legacy.filter((a) => {
    const e = state.articles[a.slug];
    return e?.triage?.decision === "rewrite" && e.status !== "drafted";
  });
  for (const a of candidates.slice(0, 15)) {
    const t = state.articles[a.slug]?.triage;
    console.log(`  - ${a.slug}  [${t?.pillar}]  ${t?.angle}`);
  }
  if (candidates.length === 0) console.log("  (none — run triage first)");
}

async function cmdTriage(
  articles: ArticleMeta[],
  state: StateFile,
  opts: { force: boolean; dryRun: boolean; model: string }
) {
  if (!opts.dryRun) await triageReady();
  const brief = TRIAGE_BACKEND === "kev" ? "" : loadBrief();
  let done = 0;
  for (const article of articles) {
    const existing = state.articles[article.slug];
    if (existing?.triage && !opts.force) {
      console.log(`skip (already triaged): ${article.slug}`);
      continue;
    }
    console.log(`triage: ${article.slug} …`);
    if (opts.dryRun) continue;
    const result = await triageOne(article, brief, opts.model);
    state.articles[article.slug] = {
      sourceFile: article.file,
      triage: result,
      draftPath: existing?.draftPath,
      status: "triaged",
    };
    writeFileSync(
      join(triageDir, `${article.slug}.json`),
      `${JSON.stringify({ slug: article.slug, ...result }, null, 2)}\n`,
      "utf8"
    );
    saveState(state);
    console.log(
      `  → ${result.decision} (${result.confidence.toFixed(2)}) · ${result.pillar} · ${result.angle}`
    );
    done += 1;
  }
  console.log(`Triage complete: ${done} updated`);
}

async function cmdDraft(
  articles: ArticleMeta[],
  state: StateFile,
  mode: "rewrite" | "annotate",
  opts: { force: boolean; dryRun: boolean; model: string }
) {
  if (!opts.dryRun) await llmReady();
  const brief = loadBrief();
  let done = 0;

  for (const article of articles) {
    const entry = state.articles[article.slug];
    const decision = entry?.triage?.decision;

    if (mode === "rewrite") {
      if (decision && decision !== "rewrite" && !opts.force) {
        console.log(`skip (decision=${decision}): ${article.slug}`);
        continue;
      }
      if (!decision) {
        console.log(`warn: no triage for ${article.slug} — rewriting anyway`);
      }
    }
    if (mode === "annotate") {
      if (decision && decision !== "annotate" && !opts.force) {
        console.log(`skip (decision=${decision}): ${article.slug}`);
        continue;
      }
    }

    const outPath = join(draftsDir, `${mode}-${article.slug}.md`);
    if (existsSync(outPath) && !opts.force) {
      console.log(`skip (draft exists, use --force): ${outPath}`);
      continue;
    }

    console.log(`${mode}: ${article.slug} → ${outPath}`);
    if (opts.dryRun) continue;

    const markdown = await rewriteOne(article, brief, opts.model, mode, entry?.triage);
    writeFileSync(outPath, markdown, "utf8");
    state.articles[article.slug] = {
      sourceFile: article.file,
      triage: entry?.triage,
      draftPath: outPath,
      status: "drafted",
    };
    saveState(state);
    done += 1;
  }
  console.log(`${mode} complete: ${done} draft(s)`);
  console.log(`Review under ${draftsDir} — never auto-published.`);
}

async function cmdBenchmark(
  all: ArticleMeta[],
  opts: { gold: string; threshold: number; model: string; dryRun: boolean }
) {
  if (!existsSync(opts.gold)) {
    throw new Error(`Gold file not found: ${opts.gold}`);
  }
  const gold = JSON.parse(readFileSync(opts.gold, "utf8")) as GoldFile;
  if (!Array.isArray(gold.labels) || gold.labels.length === 0) {
    throw new Error(`Gold file has no labels: ${opts.gold}`);
  }

  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const decisions: Decision[] = ["archive", "annotate", "rewrite"];
  const confusion: Record<Decision, Record<Decision, number>> = {
    archive: { archive: 0, annotate: 0, rewrite: 0 },
    annotate: { archive: 0, annotate: 0, rewrite: 0 },
    rewrite: { archive: 0, annotate: 0, rewrite: 0 },
  };

  type Row = {
    slug: string;
    gold: Decision;
    pred: Decision;
    confidence: number;
    ok: boolean;
    auto: boolean;
    pillar: string;
    note?: string;
  };
  const rows: Row[] = [];

  if (!opts.dryRun) await triageReady();
  const brief = TRIAGE_BACKEND === "kev" ? "" : loadBrief();

  console.log(
    `Benchmark ${gold.name ?? "gold"} · ${gold.labels.length} labels · backend=${TRIAGE_BACKEND}` +
      (TRIAGE_BACKEND === "kev" ? ` @ ${KEV_BASE_URL}` : ` model=${opts.model}`)
  );
  console.log(`Confidence threshold for auto-apply: ${opts.threshold}`);
  console.log("");

  for (const label of gold.labels) {
    const article = bySlug.get(label.slug);
    if (!article) {
      console.warn(`skip (missing article): ${label.slug}`);
      continue;
    }
    const expected = normalizeDecision(label.decision);
    console.log(`bench: ${label.slug} (gold=${expected}) …`);
    if (opts.dryRun) continue;

    const result = await triageOne(article, brief, opts.model);
    const ok = result.decision === expected;
    const auto = result.confidence >= opts.threshold;
    confusion[expected][result.decision] += 1;
    rows.push({
      slug: label.slug,
      gold: expected,
      pred: result.decision,
      confidence: result.confidence,
      ok,
      auto,
      pillar: result.pillar,
      note: label.note,
    });
    console.log(
      `  → pred=${result.decision} conf=${result.confidence.toFixed(2)} ${ok ? "OK" : "MISS"}` +
        (auto ? "" : " [below-threshold]")
    );
  }

  if (opts.dryRun) {
    console.log("Dry run — no model calls.");
    return;
  }

  const n = rows.length;
  const correct = rows.filter((r) => r.ok).length;
  const autoRows = rows.filter((r) => r.auto);
  const autoCorrect = autoRows.filter((r) => r.ok).length;
  const autoWrong = autoRows.filter((r) => !r.ok).length;
  const meanConf = n === 0 ? 0 : rows.reduce((s, r) => s + r.confidence, 0) / n;
  const meanConfOk =
    correct === 0 ? 0 : rows.filter((r) => r.ok).reduce((s, r) => s + r.confidence, 0) / correct;
  const meanConfMiss =
    n - correct === 0
      ? 0
      : rows.filter((r) => !r.ok).reduce((s, r) => s + r.confidence, 0) / (n - correct);

  console.log("");
  console.log("=== Summary ===");
  console.log(`Accuracy: ${correct}/${n} = ${n ? ((100 * correct) / n).toFixed(1) : "0.0"}%`);
  console.log(
    `Auto@${opts.threshold}: ${autoRows.length}/${n} · correct ${autoCorrect} · wrong ${autoWrong}` +
      (autoRows.length ? ` · precision ${((100 * autoCorrect) / autoRows.length).toFixed(1)}%` : "")
  );
  console.log(
    `Mean confidence: all=${meanConf.toFixed(2)} ok=${meanConfOk.toFixed(2)} miss=${meanConfMiss.toFixed(2)}`
  );

  console.log("");
  console.log("Confusion (rows=gold, cols=pred):");
  console.log(`           ${decisions.map((d) => d.padEnd(10)).join("")}`);
  for (const g of decisions) {
    const cells = decisions.map((p) => String(confusion[g][p]).padEnd(10)).join("");
    console.log(`${g.padEnd(11)}${cells}`);
  }

  const misses = rows.filter((r) => !r.ok);
  if (misses.length > 0) {
    console.log("");
    console.log("Misses:");
    for (const m of misses) {
      console.log(
        `  - ${m.slug}: gold=${m.gold} pred=${m.pred} conf=${m.confidence.toFixed(2)} · ${m.note ?? ""}`
      );
    }
  }

  const outDir = join(rewritesRoot, "benchmarks");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(outDir, `${gold.name ?? "gold"}-${stamp}.json`);
  writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        gold: opts.gold,
        backend: TRIAGE_BACKEND,
        kevBaseUrl: TRIAGE_BACKEND === "kev" ? KEV_BASE_URL : undefined,
        model: TRIAGE_BACKEND === "kev" ? KEV_MODEL : opts.model,
        threshold: opts.threshold,
        at: new Date().toISOString(),
        n,
        correct,
        accuracy: n ? correct / n : 0,
        auto: {
          threshold: opts.threshold,
          n: autoRows.length,
          correct: autoCorrect,
          wrong: autoWrong,
          precision: autoRows.length ? autoCorrect / autoRows.length : null,
        },
        meanConfidence: { all: meanConf, ok: meanConfOk, miss: meanConfMiss },
        confusion,
        rows,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  console.log("");
  console.log(`Wrote ${outPath}`);
}

function cmdQuality(all: ArticleMeta[], opts: { limit?: number; before: string }) {
  const selected = selectArticles(all, {
    before: opts.before,
    limit: opts.limit,
  });
  const rows = selected.map((a) => {
    const q = assessBlogQuality(a);
    const hard = hardArchiveDecision(q);
    return { article: a, q, hard };
  });

  rows.sort((a, b) => b.q.messScore + b.q.aiVoiceScore - (a.q.messScore + a.q.aiVoiceScore));

  console.log(`Quality inventory · ${rows.length} posts (--before ${opts.before})`);
  console.log("");
  for (const { article, q, hard } of rows) {
    const hardTag = hard ? ` HARD_ARCHIVE(${hard.confidence.toFixed(2)}:${hard.reason})` : "";
    console.log(
      `${article.slug}  mess=${q.messScore} ai=${q.aiVoiceScore}  ${q.summaryLine}${hardTag}`
    );
  }

  const hardN = rows.filter((r) => r.hard).length;
  const highAi = rows.filter((r) => r.q.aiVoiceScore >= 6).length;
  const dead = rows.filter((r) => r.q.deadStackHit).length;
  console.log("");
  console.log(`Summary: hardArchive=${hardN}  highAiVoice(>=6)=${highAi}  deadStack=${dead}`);

  const outDir = join(rewritesRoot, "quality");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `blog-quality-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        at: new Date().toISOString(),
        before: opts.before,
        n: rows.length,
        hardArchive: hardN,
        highAiVoice: highAi,
        deadStack: dead,
        rows: rows.map(({ article, q, hard }) => ({
          slug: article.slug,
          year: article.year,
          title: article.title,
          ...q,
          hardArchive: hard,
        })),
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  console.log(`Wrote ${outPath}`);
}

async function main() {
  const opts = parseArgs(process.argv);
  ensureDirs();
  const all = loadArticles();
  const state = loadState();

  if (opts.command === "status") {
    cmdStatus(all, state, opts.before);
    return;
  }

  if (opts.command === "quality") {
    cmdQuality(all, { limit: opts.limit, before: opts.before });
    return;
  }

  if (opts.command === "benchmark") {
    await cmdBenchmark(all, {
      gold: opts.gold,
      threshold: opts.threshold,
      model: opts.model ?? TRIAGE_MODEL,
      dryRun: opts.dryRun,
    });
    return;
  }

  if (opts.command === "triage") {
    const selected = selectArticles(all, opts);
    const triageLabel =
      TRIAGE_BACKEND === "kev"
        ? `kev:${KEV_MODEL}`
        : `${TRIAGE_BACKEND}:${opts.model ?? TRIAGE_MODEL}`;
    console.log(`Triage ${selected.length} article(s) with ${triageLabel}`);
    await cmdTriage(selected, state, {
      force: opts.force,
      dryRun: opts.dryRun,
      model: opts.model ?? TRIAGE_MODEL,
    });
    return;
  }

  if (opts.command === "rewrite" || opts.command === "annotate") {
    const mode = opts.command;
    if (mode === "annotate" && !opts.slug && opts.limit == null) {
      // default: only those triaged as annotate
      const annotated = all.filter((a) => state.articles[a.slug]?.triage?.decision === "annotate");
      const selected = opts.limit ? annotated.slice(0, opts.limit) : annotated;
      if (selected.length === 0) {
        console.error("No annotate candidates. Run triage or pass --slug.");
        process.exit(1);
      }
      await cmdDraft(selected, state, "annotate", {
        force: opts.force,
        dryRun: opts.dryRun,
        model: opts.model ?? REWRITE_MODEL,
      });
      return;
    }
    if (mode === "rewrite" && !opts.slug) {
      const rewritable = all.filter((a) => {
        const e = state.articles[a.slug];
        return e?.triage?.decision === "rewrite" && (opts.force || e.status !== "drafted");
      });
      const selected = opts.limit ? rewritable.slice(0, opts.limit) : rewritable;
      if (selected.length === 0) {
        // allow --before selection without triage when --force
        if (opts.force) {
          const forced = selectArticles(all, opts);
          await cmdDraft(forced, state, "rewrite", {
            force: true,
            dryRun: opts.dryRun,
            model: opts.model ?? REWRITE_MODEL,
          });
          return;
        }
        console.error(
          "No rewrite candidates. Run triage first, or pass --slug / --force --before."
        );
        process.exit(1);
      }
      console.log(`Rewrite ${selected.length} with ${opts.model ?? REWRITE_MODEL}`);
      await cmdDraft(selected, state, "rewrite", {
        force: opts.force,
        dryRun: opts.dryRun,
        model: opts.model ?? REWRITE_MODEL,
      });
      return;
    }

    const selected = selectArticles(all, opts);
    await cmdDraft(selected, state, mode, {
      force: opts.force,
      dryRun: opts.dryRun,
      model: opts.model ?? REWRITE_MODEL,
    });
    return;
  }

  console.error(`Unknown command: ${opts.command}
Commands: status | quality | triage | benchmark | rewrite | annotate
Flags: --slug --limit --before --force --dry-run --model --gold --threshold`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
