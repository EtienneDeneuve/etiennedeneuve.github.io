/**
 * Mechanical + heuristic quality signals for legacy blog posts.
 * Used by triage (Kev state enrichment, hard rules) and inventory dumps.
 */

import { readFileSync } from "node:fs";
import matter from "gray-matter";

export type QualitySeverity = "high" | "medium" | "low";

export type QualityFlag = {
  id: string;
  severity: QualitySeverity;
  detail: string;
};

export type BlogQuality = {
  slug: string;
  year: number | null;
  wordCount: number;
  flags: QualityFlag[];
  /** 0 = clean, higher = messier / more slop / more dead */
  messScore: number;
  /** 0 = no AI tells, higher = denser tells */
  aiVoiceScore: number;
  looksLikeHowTo: boolean;
  looksLikePersonal: boolean;
  looksLikeOffTopic: boolean;
  deadStackHit: boolean;
  doctrineTopicHit: boolean;
  salvageableTopicHit: boolean;
  summaryLine: string;
};

type ArticleLike = {
  slug: string;
  title: string;
  description: string;
  year: number | null;
  tags: string[];
  path: string;
  wordCount: number;
};

const DEAD_STACK_RE =
  /\b(sccm|side[\s-]?load|vorlon|oms\b|honolulu|windows server 2012|vsts\b|ink level|imprimante|printer|nexttrain|azurepscmd|cloud shell.*powershell is coming)\b/i;

const DOCTRINE_TOPIC_RE =
  /\b(zero trust|rbac|managed identit|identité manag|opentelemetry|observabilit|gitops|platform engineering|nix-darwin|apple business|entra|iac testing|infra.?test|supply.?chain|trivy|snyk|cardinalit)\b/i;

/** Still worth annotate even if frontmatter is messy. */
const SALVAGEABLE_TOPIC_RE =
  /\b(terraform|ansible|gitops|git pour|documentation as code|docs as code|megalinter|managed identit|identité manag|zero trust|rbac|observabilit|opentelemetry|infra.?test|iac)\b/i;

const HOW_TO_RE =
  /\b(how to|comment (faire|on fait)|étape|step[\s-]by[\s-]step|tutoriel|tutorial|installer|install |suivez|vous devez installer)\b/i;

const PERSONAL_RE =
  /\b(mvp !|je suis désormais mvp|mon premier|merci à tous|itcast)\b/i;

const OFF_TOPIC_RE =
  /\b(carousel linkedin|linkedin carousel|automatiser la génération des carousels|svelte,?\s*astro|frameworks? web|get-nexttrain|niveau d['']encre|imprimantes? hp)\b/i;

/** Compact AI-voice rules (subset of audit-ai-voice.ts). */
const AI_VOICE_RULES: Array<{ id: string; severity: QualitySeverity; re: RegExp }> = [
  { id: "em-dash", severity: "high", re: /\u2014/ },
  { id: "fr-pas-seulement", severity: "high", re: /pas seulement[^.]{0,80}(mais aussi|c['']est)/i },
  { id: "fr-il-est-important", severity: "high", re: /\bil est (important|essentiel|crucial) de (noter|souligner|rappeler|comprendre)\b/i },
  { id: "fr-dans-un-monde", severity: "high", re: /\bdans un monde (où|en (pleine|constante))\b/i },
  { id: "fr-holistique", severity: "high", re: /\bholistique\b/i },
  { id: "fr-synergie", severity: "high", re: /\bsynergie(s)?\b/i },
  { id: "fr-paysage", severity: "medium", re: /\bdans le paysage\b/i },
  { id: "fr-il-convient", severity: "medium", re: /\bil convient de\b/i },
  { id: "fr-permettant-ainsi", severity: "medium", re: /\bpermettant ainsi\b/i },
  { id: "fr-levier", severity: "medium", re: /\b(v[ée]ritable |puissant )?levier\b/i },
  { id: "en-delve", severity: "high", re: /\bdelve(s|d)?\b/i },
  { id: "en-landscape", severity: "medium", re: /\b(the|this|today'?s)\s+\w*\s*landscape\b/i },
  { id: "en-leverage", severity: "medium", re: /\bleverage\b/i },
  { id: "en-seamless", severity: "medium", re: /\bseamless(ly)?\b/i },
];

function severityWeight(s: QualitySeverity): number {
  if (s === "high") return 3;
  if (s === "medium") return 2;
  return 1;
}

function countMatches(text: string, re: RegExp): number {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const global = new RegExp(re.source, flags);
  return [...text.matchAll(global)].length;
}

export function assessBlogQuality(article: ArticleLike): BlogQuality {
  const raw = readFileSync(article.path, "utf8");
  const { data, content } = matter(raw);
  const body = content.trim();
  const haystack = `${article.title}\n${article.description}\n${body}`;
  const flags: QualityFlag[] = [];

  const tags = Array.isArray(data.tags) ? data.tags.map(String) : article.tags;
  if (tags.length === 0 || tags.every((t) => !t.trim() || t.trim() === '""')) {
    flags.push({ id: "empty-tags", severity: "medium", detail: "tags empty or placeholder" });
  }
  if (typeof data.ID !== "undefined" || data.author) {
    flags.push({ id: "legacy-frontmatter", severity: "low", detail: "legacy ID/author fields" });
  }
  if (!data.description || String(data.description).trim() === "") {
    flags.push({ id: "empty-description", severity: "medium", detail: "missing description" });
  }
  if (/etienne\.deneuve\.xyz/i.test(haystack)) {
    flags.push({
      id: "old-domain-links",
      severity: "high",
      detail: "links to etienne.deneuve.xyz",
    });
  }
  if (/stock-\d+/i.test(String(data.img ?? "")) || /stock-\d+/i.test(haystack)) {
    flags.push({ id: "stock-image", severity: "low", detail: "stock image path" });
  }
  if (/&quot;|&lt;|&gt;|&amp;#/.test(haystack)) {
    flags.push({ id: "html-entities", severity: "medium", detail: "raw HTML entities in body" });
  }
  if (/gist\.github\.com/i.test(haystack)) {
    flags.push({ id: "gist-embed", severity: "medium", detail: "gist script embed" });
  }
  if (/<script[\s>]/i.test(haystack)) {
    flags.push({ id: "script-tag", severity: "high", detail: "raw <script> in markdown" });
  }
  if (article.wordCount > 0 && article.wordCount < 80) {
    flags.push({ id: "very-short", severity: "high", detail: `only ${article.wordCount} words` });
  }

  const deadStackHit = DEAD_STACK_RE.test(haystack);
  if (deadStackHit) {
    flags.push({ id: "dead-stack-marker", severity: "high", detail: "dead/legacy stack marker in text" });
  }
  const doctrineTopicHit = DOCTRINE_TOPIC_RE.test(haystack);
  if (doctrineTopicHit) {
    flags.push({ id: "doctrine-topic", severity: "low", detail: "matches current doctrine topics" });
  }
  const salvageableTopicHit = SALVAGEABLE_TOPIC_RE.test(haystack);
  if (salvageableTopicHit) {
    flags.push({ id: "salvageable-topic", severity: "low", detail: "topic still worth annotate" });
  }
  const looksLikeHowTo = HOW_TO_RE.test(haystack) || /part-\d+|tp\s*-?\s*part/i.test(article.slug);
  if (looksLikeHowTo) {
    flags.push({ id: "how-to-shape", severity: "medium", detail: "reads as how-to / TP" });
  }
  const looksLikePersonal = PERSONAL_RE.test(haystack) || /\/mvp$|-mvp$/i.test(article.slug);
  if (looksLikePersonal) {
    flags.push({ id: "personal-announcement", severity: "high", detail: "personal/announcement shape" });
  }
  const looksLikeOffTopic = OFF_TOPIC_RE.test(haystack);
  if (looksLikeOffTopic && !doctrineTopicHit && !salvageableTopicHit) {
    flags.push({ id: "off-topic", severity: "high", detail: "off hub positioning" });
  }

  let aiVoiceScore = 0;
  for (const rule of AI_VOICE_RULES) {
    const n = countMatches(body, rule.re);
    if (n === 0) continue;
    aiVoiceScore += severityWeight(rule.severity) * Math.min(n, 5);
    flags.push({
      id: `ai-voice:${rule.id}`,
      severity: rule.severity,
      detail: `${n} hit(s)`,
    });
  }

  const messScore = flags
    .filter((f) => !f.id.startsWith("ai-voice:") && f.id !== "doctrine-topic")
    .reduce((s, f) => s + severityWeight(f.severity), 0);

  const summaryLine = [
    `mess=${messScore}`,
    `aiVoice=${aiVoiceScore}`,
    deadStackHit ? "deadStack" : null,
    doctrineTopicHit ? "doctrineTopic" : null,
    salvageableTopicHit ? "salvageable" : null,
    looksLikeHowTo ? "howTo" : null,
    looksLikePersonal ? "personal" : null,
    looksLikeOffTopic && !doctrineTopicHit && !salvageableTopicHit ? "offTopic" : null,
    `flags=${flags.length}`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    slug: article.slug,
    year: article.year,
    wordCount: article.wordCount,
    flags,
    messScore,
    aiVoiceScore,
    looksLikeHowTo,
    looksLikePersonal,
    looksLikeOffTopic: looksLikeOffTopic && !doctrineTopicHit && !salvageableTopicHit,
    deadStackHit,
    doctrineTopicHit,
    salvageableTopicHit,
    summaryLine,
  };
}

export function formatQualityForKevState(q: BlogQuality): string {
  const topFlags = q.flags
    .slice(0, 12)
    .map((f) => `${f.id}(${f.severity})`)
    .join(", ");
  return [
    `qualitySummary: ${q.summaryLine}`,
    `qualityFlags: ${topFlags || "(none)"}`,
    `mechanicalHints: deadStack=${q.deadStackHit} howTo=${q.looksLikeHowTo} personal=${q.looksLikePersonal} offTopic=${q.looksLikeOffTopic} doctrineTopic=${q.doctrineTopicHit} salvageable=${q.salvageableTopicHit}`,
  ].join("\n");
}

/**
 * Deterministic archive when signals are overwhelming.
 * Returns null when Kev should still decide.
 */
export function hardArchiveDecision(q: BlogQuality): {
  reason: string;
  confidence: number;
} | null {
  if (q.looksLikePersonal) {
    return { reason: "personal announcement / career note", confidence: 0.9 };
  }
  if (q.salvageableTopicHit || q.doctrineTopicHit) {
    // Never hard-archive salvageable / doctrine topics — let Kev decide annotate vs rewrite.
    return null;
  }
  if (q.looksLikeOffTopic && q.aiVoiceScore >= 3) {
    return { reason: "off-topic + AI-voice density", confidence: 0.82 };
  }
  if (q.looksLikeOffTopic && (q.year ?? 9999) >= 2024) {
    return { reason: "off-topic vs doctrine hub", confidence: 0.8 };
  }
  if (q.deadStackHit && q.looksLikeHowTo && (q.year ?? 9999) <= 2017) {
    return { reason: "pre-2018 how-to on dead stack", confidence: 0.88 };
  }
  if (q.deadStackHit && q.wordCount < 200 && (q.year ?? 9999) <= 2018) {
    return { reason: "short dead-stack note", confidence: 0.85 };
  }
  return null;
}
