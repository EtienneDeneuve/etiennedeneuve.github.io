#!/usr/bin/env bun
/**
 * Local LLM pipeline (MLX preferred, Ollama fallback): triage / annotate / rewrite
 * legacy blog posts into Thinking voice. Never writes into src/content/blog/.
 *
 * Usage:
 *   bun run rewrite:articles -- status
 *   bun run rewrite:articles -- triage [--limit N] [--slug X] [--before YYYY-MM-DD]
 *   bun run rewrite:articles -- rewrite [--slug X] [--limit N] [--force]
 *   bun run rewrite:articles -- annotate --slug X [--force]
 *
 * Env:
 *   REWRITE_BACKEND          mlx | ollama   (default mlx)
 *   MLX_BASE_URL             default http://127.0.0.1:18080/v1
 *   TRIAGE_MODEL / REWRITE_MODEL
 *     mlx defaults:
 *       mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit (triage+rewrite)
 *     ollama fallbacks:
 *       qwen3.5:9b / qwen3.5:35b-a3b
 *   OLLAMA_HOST              default http://127.0.0.1:11434
 *   WORKLOG_ROOT             default ~/Worklog
 *
 * Prefer devenv scripts: mlx-serve | rewrite-status | rewrite-triage | rewrite-draft
 *
 * Or serve MLX MoE directly:
 *   uvx --from mlx-lm mlx_lm.server \
 *     --model mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit --port 18080
 * For triage+rewrite on one server, TRIAGE_MODEL defaults to the same OptiQ id.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const blogDir = join(rootDir, "src/content/blog");
const briefPath = join(rootDir, "docs/editorial-rewrite-prompt.md");

type Backend = "mlx" | "ollama";

const BACKEND: Backend =
  (process.env.REWRITE_BACKEND ?? "mlx").toLowerCase() === "ollama" ? "ollama" : "mlx";
const MLX_BASE_URL = (process.env.MLX_BASE_URL ?? "http://127.0.0.1:18080/v1").replace(/\/$/, "");
const OLLAMA_HOST = (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434").replace(/\/$/, "");

const DEFAULT_REWRITE =
  BACKEND === "mlx" ? "mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit" : "qwen2.5:14b";
/** Same MoE by default so one mlx_lm.server covers triage + rewrite. Override with 9B for speed. */
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
  };
}

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

async function triageOne(
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
  console.log(
    BACKEND === "mlx" ? `Backend: mlx @ ${MLX_BASE_URL}` : `Backend: ollama @ ${OLLAMA_HOST}`
  );
  console.log(`Models: triage=${TRIAGE_MODEL}  rewrite=${REWRITE_MODEL}`);
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
  if (!opts.dryRun) await llmReady();
  const brief = loadBrief();
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

async function main() {
  const opts = parseArgs(process.argv);
  ensureDirs();
  const all = loadArticles();
  const state = loadState();

  if (opts.command === "status") {
    cmdStatus(all, state, opts.before);
    return;
  }

  if (opts.command === "triage") {
    const selected = selectArticles(all, opts);
    console.log(`Triage ${selected.length} article(s) with ${opts.model ?? TRIAGE_MODEL}`);
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
Commands: status | triage | rewrite | annotate
Flags: --slug --limit --before --force --dry-run --model`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
