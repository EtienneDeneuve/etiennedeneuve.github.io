import type { CollectionEntry } from "astro:content";

export const DISCLOSURE_LEVELS = ["public", "anonymized", "confidential-summary"] as const;

export type DisclosureLevel = (typeof DISCLOSURE_LEVELS)[number];

export const PROOF_TYPES = [
  "public-repository",
  "documentation",
  "technical-article",
  "recorded-conference",
  "authorized-demo",
  "verified-metric",
  "authorized-testimonial",
  "accessible-product",
  "publishable-architecture",
] as const;

export type ProofType = (typeof PROOF_TYPES)[number];

export type StructuredEvidence = {
  type: ProofType;
  label?: string;
  url?: string;
  description: string;
};

export const PLACEHOLDER_PATTERNS: RegExp[] = [
  /\bClient\s+[A-Z]\b/i,
  /\bLorem\s+ipsum\b/i,
  /\bTODO\b/,
  /\bTBD\b/,
  /\bFIXME\b/,
  /\[PLACEHOLDER[^\]]*\]/i,
  /\bPLACEHOLDER\s*:/i,
  /\bXXX\b/,
  /\bexample\.com\b/i,
  /\[\.\.\.\]/,
];

export const ABSOLUTE_CLAIM_PATTERNS: RegExp[] = [
  /\b\d{1,3}\s*%\b/,
  /\b100\s*%\b/i,
  /\b(garanti|guaranteed|always|toujours|never|jamais|zero downtime|sans faille)\b/i,
  /\b(réduction|reduction|diminution|amélioration|improvement)\s+(de\s+)?\d+/i,
];

export type PolicyIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  path: string;
};

export type PublicationPolicyResult = {
  ok: boolean;
  errors: PolicyIssue[];
  warnings: PolicyIssue[];
};

export function disclosureLabel(level: DisclosureLevel, lang: "fr" | "en" = "fr"): string {
  const labels: Record<DisclosureLevel, { fr: string; en: string }> = {
    public: { fr: "Public", en: "Public" },
    anonymized: { fr: "Anonymisé", en: "Anonymized" },
    "confidential-summary": {
      fr: "Synthèse confidentielle",
      en: "Confidential summary",
    },
  };
  return labels[level]?.[lang] ?? level;
}

export function proofTypeLabel(type: ProofType, lang: "fr" | "en" = "fr"): string {
  const labels: Record<ProofType, { fr: string; en: string }> = {
    "public-repository": { fr: "Repository public", en: "Public repository" },
    documentation: { fr: "Documentation", en: "Documentation" },
    "technical-article": { fr: "Article technique", en: "Technical article" },
    "recorded-conference": { fr: "Conférence enregistrée", en: "Recorded conference" },
    "authorized-demo": { fr: "Démonstration autorisée", en: "Authorized demo" },
    "verified-metric": { fr: "Métrique vérifiée", en: "Verified metric" },
    "authorized-testimonial": { fr: "Témoignage autorisé", en: "Authorized testimonial" },
    "accessible-product": { fr: "Produit accessible", en: "Accessible product" },
    "publishable-architecture": {
      fr: "Architecture publiable",
      en: "Publishable architecture",
    },
  };
  return labels[type][lang];
}

function collectStrings(value: unknown, bucket: string[] = []): string[] {
  if (typeof value === "string") {
    bucket.push(value);
    return bucket;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, bucket);
    return bucket;
  }
  if (value && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectStrings(nested, bucket);
    }
  }
  return bucket;
}

export function findPlaceholders(text: string): string[] {
  return PLACEHOLDER_PATTERNS.filter((pattern) => pattern.test(text)).map(
    (pattern) => pattern.source
  );
}

export function findAbsoluteClaims(text: string): string[] {
  return ABSOLUTE_CLAIM_PATTERNS.filter((pattern) => pattern.test(text)).map(
    (pattern) => pattern.source
  );
}

export function validateNoPlaceholders(
  entryId: string,
  data: Record<string, unknown>,
  draft: boolean
): PolicyIssue[] {
  if (draft) return [];
  const issues: PolicyIssue[] = [];
  for (const text of collectStrings(data)) {
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(text)) {
        issues.push({
          level: "error",
          code: "placeholder-content",
          message: `Placeholder or forbidden pattern detected (${pattern.source})`,
          path: entryId,
        });
        break;
      }
    }
  }
  return issues;
}

export function validateAbsoluteClaims(entryId: string, texts: string[]): PolicyIssue[] {
  const issues: PolicyIssue[] = [];
  for (const text of texts) {
    for (const pattern of ABSOLUTE_CLAIM_PATTERNS) {
      if (pattern.test(text)) {
        issues.push({
          level: "warning",
          code: "unsourced-absolute-claim",
          message: `Possible unsourced absolute claim (${pattern.source}): "${text.slice(0, 120)}"`,
          path: entryId,
        });
        break;
      }
    }
  }
  return issues;
}

export function validateEvidenceList(
  entryId: string,
  evidence: StructuredEvidence[],
  draft: boolean
): PolicyIssue[] {
  if (draft || evidence.length === 0) return [];
  const issues: PolicyIssue[] = [];
  for (const [index, item] of evidence.entries()) {
    const hasDescription = Boolean(item.description?.trim());
    const hasUrl = Boolean(item.url?.trim());
    if (!hasDescription && !hasUrl) {
      issues.push({
        level: "error",
        code: "missing-proof-reference",
        message: `Evidence item ${index + 1} has no URL and no description`,
        path: `${entryId}#evidence[${index}]`,
      });
    }
  }
  return issues;
}

export function validatePublishedCaseStudy(entry: CollectionEntry<"caseStudies">): PolicyIssue[] {
  const { data } = entry;
  if (data.draft) return [];

  const issues: PolicyIssue[] = [
    ...validateNoPlaceholders(entry.id, data as unknown as Record<string, unknown>, false),
  ];

  for (const metric of data.outcomes.metrics) {
    if (!metric.verified) {
      issues.push({
        level: "error",
        code: "unverified-metric",
        message: `Published case study metric "${metric.label}" is not verified`,
        path: `${entry.id}#metrics.${metric.label}`,
      });
    }
  }

  const evidence = normalizeEvidenceList(data.evidence);
  issues.push(...validateEvidenceList(entry.id, evidence, false));

  const outcomeTexts = [data.outcomes.summary, ...data.results, ...data.workPerformed];
  issues.push(...validateAbsoluteClaims(entry.id, outcomeTexts));

  return issues;
}

export function normalizeEvidenceList(
  evidence: CollectionEntry<"caseStudies">["data"]["evidence"]
): StructuredEvidence[] {
  return evidence.map((item) => {
    if (typeof item === "string") {
      return {
        type: "documentation" as ProofType,
        description: item,
      };
    }
    return item as StructuredEvidence;
  });
}

export function isPublishableDraft(entry: { data: { draft?: boolean } }): boolean {
  return !entry.data.draft;
}

/** Hide scheduled posts until pubDate (static builds use build-time "now"). */
export function isReleasedByPubDate(
  entry: { data: { draft?: boolean; pubDate?: Date | string | number } },
  now: Date = new Date()
): boolean {
  if (!isPublishableDraft(entry)) return false;
  const raw = entry.data.pubDate;
  if (raw == null) return true;
  const pub = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(pub.getTime())) return true;
  return pub.getTime() <= now.getTime();
}

export function getPublishableEntries<T extends { data: { draft?: boolean } }>(entries: T[]): T[] {
  return entries.filter(isPublishableDraft);
}

export function getReleasedArticles<
  T extends { data: { draft?: boolean; pubDate?: Date | string | number } },
>(entries: T[], now: Date = new Date()): T[] {
  return entries.filter((entry) => isReleasedByPubDate(entry, now));
}

export type PublicationCollections = {
  blog: Array<{ id: string; data: Record<string, unknown> & { draft?: boolean } }>;
  caseStudies: Array<{
    id: string;
    data: {
      draft?: boolean;
      outcomes: {
        summary: string;
        metrics: Array<{
          label: string;
          before: string;
          after: string;
          unit: string;
          source: string;
          verified: boolean;
        }>;
      };
      evidence: Array<string | StructuredEvidence>;
      results: string[];
      workPerformed: string[];
    };
  }>;
  projects: Array<{
    id: string;
    data: Record<string, unknown> & { draft?: boolean; verified?: boolean; name?: string };
  }>;
  appearances: Array<{ id: string; data: Record<string, unknown> & { draft?: boolean } }>;
  resources: Array<{ id: string; data: Record<string, unknown> & { draft?: boolean } }>;
};

function asCaseStudyEntry(
  entry: PublicationCollections["caseStudies"][number]
): CollectionEntry<"caseStudies"> {
  return entry as unknown as CollectionEntry<"caseStudies">;
}

export function runPublicationPolicyChecks(
  collections: PublicationCollections
): PublicationPolicyResult {
  const errors: PolicyIssue[] = [];
  const warnings: PolicyIssue[] = [];

  for (const entry of collections.caseStudies) {
    for (const issue of validatePublishedCaseStudy(asCaseStudyEntry(entry))) {
      if (issue.level === "error") errors.push(issue);
      else warnings.push(issue);
    }
  }

  const genericCollections: Array<{
    name: string;
    entries: Array<{ id: string; data: Record<string, unknown> & { draft?: boolean } }>;
  }> = [
    { name: "blog", entries: collections.blog },
    { name: "projects", entries: collections.projects },
    { name: "appearances", entries: collections.appearances },
    { name: "resources", entries: collections.resources },
  ];

  for (const { entries } of genericCollections) {
    for (const entry of entries) {
      const draft = Boolean(entry.data.draft);
      for (const issue of validateNoPlaceholders(entry.id, entry.data, draft)) {
        errors.push(issue);
      }
    }
  }

  for (const entry of collections.projects) {
    if (entry.data.draft) continue;
    if (!entry.data.verified) {
      warnings.push({
        level: "warning",
        code: "unverified-project",
        message: `Published project "${entry.data.name}" is not marked verified`,
        path: entry.id,
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export const FALLBACK_PROOF_LINKS = {
  projects: ["omnivya", "external-metrics-exporter", "sanad", "my-dare"],
  articles: [
    "2024-09-16-managed-identities",
    "2023-07-28-megalinter-azure-devops",
    "2024-02-11-zero-trust-overview",
  ],
} as const;
