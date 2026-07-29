import { startHereConfig } from "./start-here.ts";

export type ThinkingPillar =
  | "systems-and-risk"
  | "platform-engineering"
  | "cloud-and-infrastructure"
  | "software-supply-chain"
  | "observability"
  | "product-and-markets"
  | "technical-leadership";

export type ThinkingContentType =
  | "doctrine"
  | "field-note"
  | "architecture-decision"
  | "technical-guide"
  | "opinion"
  | "case-analysis";

export type ThinkingSort = "featured" | "recent" | "oldest" | "title";

type Localized = { fr: string; en: string };

export const thinkingConfig = {
  meta: {
    title: { fr: "Thinking", en: "Thinking" } as Localized,
    description: {
      fr: "Bibliothèque de pensée : doctrine, guides, décisions d'architecture et notes terrain.",
      en: "Thinking library: doctrine, guides, architecture decisions, and field notes.",
    } as Localized,
    intro: {
      fr: "Articles classés par pilier et type de contenu : la récence n'est pas le seul critère de navigation.",
      en: "Articles organized by pillar and content type : recency is not the only navigation criterion.",
    } as Localized,
  },
  /** Minimum publishable articles sharing a tag before generating a tag page. */
  minTagArticles: 3,
  /** Editorial featured slugs (filename-based Astro slugs). */
  featuredSlugs: [
    "2026-07-06-observabilite-contrat-testable",
    "2026-07-13-rendre-observables-agents-ci-ephemeres",
    "2026-07-08-gitops-separer-versions-infra-et-images",
    "2024-09-16-managed-identities",
    "2018-06-26-documentation-as-code",
  ],
  pillarLabels: {
    "systems-and-risk": {
      fr: "Systèmes et risque",
      en: "Systems and risk",
    },
    "platform-engineering": {
      fr: "Platform engineering",
      en: "Platform engineering",
    },
    "cloud-and-infrastructure": {
      fr: "Cloud et infrastructure",
      en: "Cloud and infrastructure",
    },
    "software-supply-chain": {
      fr: "Supply chain logicielle",
      en: "Software supply chain",
    },
    observability: { fr: "Observabilité", en: "Observability" },
    "product-and-markets": {
      fr: "Produit et marchés",
      en: "Product and markets",
    },
    "technical-leadership": {
      fr: "Leadership technique",
      en: "Technical leadership",
    },
  } satisfies Record<ThinkingPillar, Localized>,
  contentTypeLabels: {
    doctrine: { fr: "Doctrine", en: "Doctrine" },
    "field-note": { fr: "Note terrain", en: "Field note" },
    "architecture-decision": {
      fr: "Décision d'architecture",
      en: "Architecture decision",
    },
    "technical-guide": { fr: "Guide technique", en: "Technical guide" },
    opinion: { fr: "Opinion", en: "Opinion" },
    "case-analysis": { fr: "Analyse de cas", en: "Case analysis" },
  } satisfies Record<ThinkingContentType, Localized>,
  sortLabels: {
    featured: { fr: "Mis en avant", en: "Featured" },
    recent: { fr: "Plus récents", en: "Most recent" },
    oldest: { fr: "Plus anciens", en: "Oldest first" },
    title: { fr: "Titre (A–Z)", en: "Title (A–Z)" },
  } satisfies Record<ThinkingSort, Localized>,
  labels: {
    featured: { fr: "Mis en avant", en: "Featured" },
    allArticles: { fr: "Bibliothèque", en: "Library" },
    readingPaths: { fr: "Parcours de lecture", en: "Reading paths" },
    filters: { fr: "Filtrer", en: "Filter" },
    reset: { fr: "Réinitialiser", en: "Reset" },
    pillar: { fr: "Pilier", en: "Pillar" },
    type: { fr: "Type", en: "Type" },
    language: { fr: "Langue", en: "Language" },
    sort: { fr: "Tri", en: "Sort" },
    all: { fr: "Tous", en: "All" },
    read: { fr: "Lire", en: "Read" },
    updated: { fr: "Mis à jour", en: "Updated" },
    published: { fr: "Publié", en: "Published" },
    readingTime: { fr: "Lecture", en: "Reading time" },
    related: { fr: "Contenus associés", en: "Related content" },
    relatedProjects: { fr: "Projets liés", en: "Related projects" },
    toc: { fr: "Sommaire", en: "Table of contents" },
    prev: { fr: "Précédent", en: "Previous" },
    next: { fr: "Suivant", en: "Next" },
    translation: { fr: "Traduction", en: "Translation" },
    rss: { fr: "Flux RSS", en: "RSS feed" },
    rssByPillar: { fr: "RSS par pilier", en: "RSS by pillar" },
    browsePillars: { fr: "Par pilier", en: "By pillar" },
    browseTypes: { fr: "Par type", en: "By type" },
    browseTags: { fr: "Par tag", en: "By tag" },
    articlesCount: { fr: "articles", en: "articles" },
  } as Record<string, Localized>,
  /** Reuse Start Here editorial reading paths. */
  readingPaths: startHereConfig.learningPaths,
} as const;

export const thinkingPillars = Object.keys(thinkingConfig.pillarLabels) as ThinkingPillar[];

export const thinkingContentTypes = Object.keys(
  thinkingConfig.contentTypeLabels
) as ThinkingContentType[];
