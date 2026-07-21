import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const markdownGlob = "**/[^_]*.{md,mdx}";

const languageEnum = z.enum(["fr", "en"]);
const articleTypeEnum = z.enum([
  "doctrine",
  "field-note",
  "architecture-decision",
  "technical-guide",
  "opinion",
  "case-analysis",
]);
const pillarEnum = z.enum([
  "systems-and-risk",
  "platform-engineering",
  "cloud-and-infrastructure",
  "software-supply-chain",
  "observability",
  "product-and-markets",
  "technical-leadership",
]);
const audienceEnum = z.enum([
  "cto-cio-ciso",
  "engineering-leads",
  "engineers",
  "partners",
  "media",
  "general",
]);

const normalizeArticle = (raw: unknown) => {
  if (!raw || typeof raw !== "object") return raw;
  const data = raw as Record<string, unknown>;
  return {
    ...data,
    lastModified: data.lastModified ?? data.updateDate,
    language: data.language ?? "fr",
    contentType: data.contentType ?? "technical-guide",
    pillar: data.pillar ?? "cloud-and-infrastructure",
    audience: data.audience ?? ["engineers"],
    featured: data.featured ?? false,
    draft: data.draft ?? false,
    imgAlt: data.imgAlt ?? data.img_alt,
    relatedProjects: data.relatedProjects ?? [],
    relatedArticles: data.relatedArticles ?? [],
  };
};

const articlesSchema = z.preprocess(
  normalizeArticle,
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    language: languageEnum,
    translationKey: z.string().optional(),
    contentType: articleTypeEnum,
    pillar: pillarEnum,
    audience: z.array(audienceEnum),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
    relatedProjects: z.array(z.string()).default([]),
    relatedArticles: z.array(z.string()).default([]),
    decisionSummary: z.string().optional(),
    img: z.string().optional(),
    imgAlt: z.string().optional(),

    // Legacy compatibility fields (existing blog content)
    minutesRead: z.string().optional(),
    slug: z.string().optional(),
    updateDate: z.coerce.date().optional(),
    img_alt: z.string().optional(),
  })
);

const proofItemSchema = z.object({
  type: z
    .enum([
      "public-repository",
      "documentation",
      "technical-article",
      "recorded-conference",
      "authorized-demo",
      "verified-metric",
      "authorized-testimonial",
      "accessible-product",
      "publishable-architecture",
    ])
    .optional(),
  label: z.string(),
  url: z.string().url().optional(),
  description: z.string(),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: markdownGlob, base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    name_en: z.string().optional(),
    projectSlug: z.string().optional(),
    summary: z.string(),
    summary_en: z.string().optional(),
    status: z.enum(["idea", "alpha", "beta", "production", "maintenance", "archived"]),
    type: z.enum(["company", "product", "open-source", "client-work", "experiment"]),
    role: z.string(),
    role_en: z.string().optional(),
    problem: z.string(),
    problem_en: z.string().optional(),
    context: z.string().default(""),
    context_en: z.string().optional(),
    decisions: z.array(z.string()).default([]),
    decisions_en: z.array(z.string()).optional(),
    principles: z.array(z.string()).default([]),
    principles_en: z.array(z.string()).optional(),
    whatExists: z.array(z.string()).default([]),
    whatExists_en: z.array(z.string()).optional(),
    currentState: z.string().default(""),
    currentState_en: z.string().optional(),
    limitations: z.array(z.string()).default([]),
    limitations_en: z.array(z.string()).optional(),
    learnings: z.array(z.string()).default([]),
    learnings_en: z.array(z.string()).optional(),
    relatedArticles: z.array(z.string()).default([]),
    proofs: z.array(proofItemSchema).default([]),
    proofLinks: z.array(z.string().url()).default([]),
    repository: z.string().url().optional(),
    website: z.string().url().optional(),
    technologies: z.array(z.string()).default([]),
    startedAt: z.coerce.date(),
    verified: z.boolean().default(false),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    displayOrder: z.number().default(99),
    ecosystemRole: z.string().optional(),
    ecosystemRole_en: z.string().optional(),
  }),
});

const metricSchema = z.object({
  label: z.string(),
  before: z.string(),
  after: z.string(),
  unit: z.string(),
  source: z.string(),
  verified: z.boolean(),
});

const proofTypeEnum = z.enum([
  "public-repository",
  "documentation",
  "technical-article",
  "recorded-conference",
  "authorized-demo",
  "verified-metric",
  "authorized-testimonial",
  "accessible-product",
  "publishable-architecture",
]);

const evidenceItemSchema = z.union([
  z.string(),
  z.object({
    type: proofTypeEnum,
    label: z.string().optional(),
    url: z.string().url().optional(),
    description: z.string(),
  }),
]);

const disclosureLevelEnum = z.enum(["public", "anonymized", "confidential-summary"]);

type DisclosureLevel = "public" | "anonymized" | "confidential-summary";

const normalizeDisclosureLevel = (value: unknown): DisclosureLevel => {
  if (value === "public" || value === "anonymized" || value === "confidential-summary") {
    return value;
  }
  if (value === "named-with-consent") return "anonymized";
  if (value === "restricted") return "confidential-summary";
  return "anonymized";
};

const containsForbiddenPlaceholder = (raw: unknown): boolean => {
  const text = JSON.stringify(raw ?? "");
  return (
    /\bClient\s+[A-Z]\b/i.test(text) ||
    /\[PLACEHOLDER[^\]]*\]/i.test(text) ||
    /\bPLACEHOLDER\s*:/i.test(text)
  );
};

const normalizeCaseStudy = (raw: unknown) => {
  if (!raw || typeof raw !== "object") return raw;
  const data = raw as Record<string, unknown>;
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
    legacyMetricArray.length > 0 && !legacyMetricArray.every((m) => m.verified);
  const draftFromPlaceholder = containsForbiddenPlaceholder(data);
  const normalizedDraft =
    draftFromLegacy ||
    draftFromPlaceholder ||
    typeof data.draft !== "boolean" ||
    data.draft === true
      ? true
      : false;

  return {
    ...data,
    summary: data.summary ?? data.problem ?? "",
    industry: data.industry ?? data.clientIndustry ?? "non-disclosed",
    context: data.context ?? data.timeframe ?? "",
    constraints: data.constraints ?? [],
    decisions: data.decisions ?? (data.approach ? [String(data.approach)] : []),
    workPerformed:
      data.workPerformed ??
      (data.approach ? [String(data.approach)] : legacyResults.length > 0 ? legacyResults : []),
    outcomes: data.outcomes ?? {
      summary: legacyResults.join(" "),
      metrics: legacyMetricArray,
    },
    evidence: data.evidence ?? [],
    disclosureLevel: normalizeDisclosureLevel(data.disclosureLevel),
    featured: data.featured ?? false,
    draft: normalizedDraft,
    pubDate: data.pubDate,
    clientIndustry: data.clientIndustry ?? data.industry ?? "non-disclosed",
    results: Array.isArray(data.results) ? data.results : legacyResults,
    metrics:
      legacyMetrics && typeof legacyMetrics === "object"
        ? legacyMetrics
        : ({} as Record<string, string>),
  };
};

const caseStudiesCollection = defineCollection({
  loader: glob({ pattern: markdownGlob, base: "./src/content/caseStudies" }),
  schema: z
    .preprocess(
      normalizeCaseStudy,
      z.object({
        title: z.string(),
        summary: z.string(),
        industry: z.string(),
        context: z.string(),
        constraints: z.array(z.string()).default([]),
        decisions: z.array(z.string()).default([]),
        workPerformed: z.array(z.string()).default([]),
        outcomes: z.object({
          summary: z.string().default(""),
          metrics: z.array(metricSchema).default([]),
        }),
        evidence: z.array(evidenceItemSchema).default([]),
        disclosureLevel: disclosureLevelEnum,
        featured: z.boolean().default(false),
        draft: z.boolean().default(true),
        pubDate: z.coerce.date(),

        // Legacy compatibility fields (existing caseStudies content)
        clientIndustry: z.string().default("non-disclosed"),
        timeframe: z.string().optional(),
        problem: z.string().optional(),
        approach: z.string().optional(),
        results: z.array(z.string()).default([]),
        metrics: z.record(z.string(), z.string()).default({}),
        tags: z.array(z.string()).optional(),
        img: z.string().optional(),
        img_alt: z.string().optional(),
      })
    )
    .superRefine((value, ctx) => {
      const allMetricsVerified = value.outcomes.metrics.every((metric) => metric.verified);
      if (!value.draft && !allMetricsVerified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A case study cannot be published when one or more metrics are not verified.",
          path: ["outcomes", "metrics"],
        });
      }
      if (value.outcomes.metrics.some((metric) => !metric.verified) && !value.draft) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Set draft=true when metrics are unverified.",
          path: ["draft"],
        });
      }
    }),
});

const appearancesCollection = defineCollection({
  loader: glob({ pattern: markdownGlob, base: "./src/content/appearances" }),
  schema: z.object({
    title: z.string(),
    title_en: z.string().optional(),
    event: z.string(),
    event_en: z.string().optional(),
    type: z.enum(["conference", "podcast", "panel", "training", "media", "keynote", "workshop"]),
    date: z.coerce.date(),
    location: z.string(),
    location_en: z.string().optional(),
    language: languageEnum,
    topic: z.string(),
    topic_en: z.string().optional(),
    url: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    slidesUrl: z.string().url().optional(),
    proofUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const normalizeResource = (raw: unknown) => {
  if (!raw || typeof raw !== "object") return raw;
  const data = raw as Record<string, unknown>;
  let resourceKind = data.resourceKind;
  if (!resourceKind) {
    resourceKind = data.repository ? "open-source-project" : "third-party-recommendation";
  }
  return {
    ...data,
    resourceKind,
    producedByEtienne: data.producedByEtienne ?? resourceKind === "produced-by-etienne",
    type: data.type ?? "link",
    level: data.level ?? "intermediate",
    img_alt: data.img_alt ?? data.imgAlt ?? "",
  };
};

const resourcesCollection = defineCollection({
  loader: glob({ pattern: markdownGlob, base: "./src/content/resources" }),
  schema: z.preprocess(
    normalizeResource,
    z.object({
      title: z.string(),
      description: z.string(),
      resourceKind: z.enum([
        "produced-by-etienne",
        "open-source-project",
        "third-party-recommendation",
      ]),
      producedByEtienne: z.boolean().default(false),
      repository: z.string().url().optional(),
      url: z.string().url().optional(),
      tags: z.array(z.string()).default([]),
      lastReviewed: z.coerce.date(),
      pubDate: z.coerce.date().optional(),

      // Legacy compatibility fields
      type: z.enum(["guide", "link", "tool", "book", "podcast", "video", "course"]),
      level: z.enum(["beginner", "intermediate", "advanced"]),
      topic: z.string().optional(),
      category: z.string().optional(),
      img: z.string().url().optional(),
      img_alt: z.string().default(""),
      summary: z.string().optional(),
      whyItMatters: z.string().optional(),
      whenToUse: z.string().optional(),
      timeToConsume: z.string().optional(),
    })
  ),
});

// Legacy collection name kept for backward compatibility with existing routes.
const blogCollection = defineCollection({
  loader: glob({ pattern: markdownGlob, base: "./src/content/blog" }),
  schema: articlesSchema,
});

const articlesCollection = defineCollection({
  loader: glob({ pattern: markdownGlob, base: "./src/content/articles" }),
  schema: articlesSchema,
});

export const collections = {
  blog: blogCollection,
  articles: articlesCollection,
  projects: projectsCollection,
  caseStudies: caseStudiesCollection,
  appearances: appearancesCollection,
  resources: resourcesCollection,
};
