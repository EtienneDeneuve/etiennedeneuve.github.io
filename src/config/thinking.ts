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

export type ThinkingSeries = {
  id: string;
  title: Localized;
  hint: Localized;
  /** Canonical FR article ids (filename stems), reading order. */
  articleIds: readonly string[];
};

export type ThinkingArticleCta = {
  question: Localized;
  value: Localized;
  primaryLabel: Localized;
  secondaryLabel: Localized;
  utmContent: string;
};

export const thinkingConfig = {
  meta: {
    title: { fr: "Publications", en: "Writing" } as Localized,
    description: {
      fr: "Retours de terrain : équipes, delivery, architecture, plateforme, observabilité et CI.",
      en: "Field notes: teams, delivery, architecture, platform, observability, and CI.",
    } as Localized,
    /** Canonical line: cash-factory-backlog #173 / PR #121 — CTO expert. */
    intro: {
      fr: "Notes d’un CTO expert — équipes, delivery, technique et transmission. À relire, pas à cataloguer.",
      en: "Notes from a hands-on CTO — teams, delivery, technology and teaching. Written to be re-read, not catalogued.",
    } as Localized,
  },
  author: {
    name: "Étienne Deneuve",
    role: { fr: "CTO expert", en: "Hands-on CTO" } as Localized,
    portraitSrc: "/assets/portrait-cto-conseil.jpeg",
    /** Four dimensions from #173: teams, delivery, technical depth, transmission. */
    signOff: {
      fr: "Je dirige des équipes, je reste dans le code et les plateformes, et je vérifie ce qui change vraiment le delivery. J’anime aussi ateliers, interventions et formations.",
      en: "I lead teams, stay in the code and on platforms, and check what actually improves delivery. I also run workshops, talks and training.",
    } as Localized,
  },
  /**
   * One factual bridge so Omnivya is not read as a third-party vendor (#175).
   * Shown next to end-of-article CTAs only — not a floating sales dock.
   */
  omnivyaBridge: {
    fr: "Omnivya est l’entreprise que j’ai cofondée avec Taous, et dont je suis CTO. Les missions structurées y passent.",
    en: "Omnivya is the company I co-founded with Taous, and where I serve as CTO. Structured engagements run through it.",
  } as Localized,
  contactAside: {
    fr: "Pour une question ou un échange sans brief commercial :",
    en: "For a question or a conversation without a sales brief:",
  } as Localized,
  /** Minimum publishable articles sharing a tag before generating a tag page. */
  minTagArticles: 3,
  /** Opening shelf size on /thinking (1 lead + N side). */
  openingSideCount: 2,
  /** First library page size before “see more”. */
  libraryPageSize: 12,
  /**
   * Editorial series (published entry = first id). Counts use released articles only.
   * EN siblings use `{id}-en` when present.
   */
  series: [
    {
      id: "ci-ia",
      title: {
        fr: "Quand l’IA accélère le code, la CI doit suivre",
        en: "When AI speeds up the code, CI has to keep up",
      },
      hint: {
        fr: "Validations sur le poste ; GitHub garde le dernier mot.",
        en: "Workstation checks; GitHub keeps the final say.",
      },
      articleIds: [
        "2026-10-09-ia-accelere-code-ci-doit-suivre",
        "2026-10-16-deplacer-ci-sur-mac-devenv",
        "2026-10-23-github-garde-dernier-mot-ci-locale",
        "2026-10-30-tester-changement-sans-tout-relancer",
        "2026-11-06-retour-experience-ci-locale-ia",
        "2026-11-13-mesurer-impact-ci-locale",
      ],
    },
    {
      id: "nix-entra",
      title: {
        fr: "Nix, Entra et Apple Business",
        en: "Nix, Entra, and Apple Business",
      },
      hint: {
        fr: "Séparer enrollment, identité et état du poste.",
        en: "Separate enrollment, identity, and workstation state.",
      },
      articleIds: [
        "2026-10-03-provisioning-mac-pas-probleme-mdm",
        "2026-10-14-apple-business-entra-identite-workstation",
        "2026-10-21-pourquoi-app-macos-swiftui-provisioning",
        "2026-10-28-versionner-postes-semver-nix",
        "2026-11-04-ce-qui-casse-provisioning-macos",
      ],
    },
    {
      id: "otel",
      title: {
        fr: "OpenTelemetry en production",
        en: "OpenTelemetry in production",
      },
      hint: {
        fr: "De Dynatrace à l’exploitation de la stack open source.",
        en: "From Dynatrace to operating the open-source stack.",
      },
      articleIds: [
        "2026-09-22-opentelemetry-pourquoi-je-lai-propose",
        "2026-09-22-opentelemetry-instrumenter-200-services",
        "2026-09-22-opentelemetry-cardinalite-pii-sampling",
        "2026-09-22-opentelemetry-exploiter-la-plateforme",
      ],
    },
  ] as const satisfies readonly ThinkingSeries[],
  /** Contextual CTAs keyed by FR article id (EN uses same key via translationKey / stem). */
  articleCtas: {
    "2026-07-08-gitops-separer-versions-infra-et-images": {
      question: {
        fr: "Vos promotions GitOps mélangent encore infra et versions applicatives ?",
        en: "Do your GitOps promotions still mix infra changes and app versions?",
      },
      value: {
        fr: "Clarifier les canaux, leurs contrats de compatibilité et les limites du rollback avant de figer le processus.",
        en: "Clarify promotion channels, compatibility contracts, and rollback limits before freezing the process.",
      },
      primaryLabel: {
        fr: "En parler via Omnivya",
        en: "Talk it through via Omnivya",
      },
      secondaryLabel: {
        fr: "Voir comment j’interviens",
        en: "See how I work with teams",
      },
      utmContent: "thinking-gitops",
    },
    "2026-09-22-opentelemetry-instrumenter-200-services": {
      question: {
        fr: "Vous héritez d’un parc instrumenté hétérogène et d’une migration d’observabilité ?",
        en: "Inheriting a mixed instrumentation estate and an observability migration?",
      },
      value: {
        fr: "Poser un cadre OpenTelemetry réaliste : couverture, cardinalité, et ce qu’il faudra quand même opérer.",
        en: "Set a realistic OpenTelemetry frame: coverage, cardinality, and what you still have to operate.",
      },
      primaryLabel: {
        fr: "En parler via Omnivya",
        en: "Talk it through via Omnivya",
      },
      secondaryLabel: {
        fr: "Voir comment j’interviens",
        en: "See how I work with teams",
      },
      utmContent: "thinking-otel-cover",
    },
  } as const satisfies Record<string, ThinkingArticleCta>,
  /** Editorial featured slugs (filename-based Astro slugs) — used as fallback only. */
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
    allLanguages: { fr: "Toutes les langues", en: "All languages" },
    read: { fr: "Lire", en: "Read" },
    updated: { fr: "Mis à jour", en: "Updated" },
    published: { fr: "Publié", en: "Published" },
    readingTime: { fr: "Lecture", en: "Reading time" },
    related: { fr: "Problématique similaire", en: "Similar themes" },
    relatedProjects: { fr: "Projets liés", en: "Related projects" },
    toc: { fr: "Dans cet article", en: "In this article" },
    quickNav: { fr: "Navigation rapide", en: "Quick nav" },
    headingAnchor: { fr: "Lien vers cette section", en: "Link to this section" },
    prev: { fr: "Précédent", en: "Previous" },
    next: { fr: "Suite", en: "Next" },
    translation: { fr: "Traduction", en: "Translation" },
    rss: { fr: "Flux RSS", en: "RSS feed" },
    rssByPillar: { fr: "RSS par pilier", en: "RSS by pillar" },
    browse: { fr: "Explorer", en: "Browse" },
    browsePillars: { fr: "Par pilier", en: "By pillar" },
    browseTypes: { fr: "Par type", en: "By type" },
    browseTags: { fr: "Par tag", en: "By tag" },
    articlesCount: { fr: "articles", en: "articles" },
    opening: { fr: "À la une", en: "Featured now" },
    openingAll: { fr: "Toutes", en: "All" },
    series: { fr: "Séries publiées", en: "Published series" },
    seriesEyebrow: { fr: "Dossiers", en: "Dossiers" },
    library: { fr: "Bibliothèque", en: "Library" },
    seeMore: { fr: "Voir plus d’articles", en: "See more articles" },
    readAnalysis: { fr: "Lire l’analyse", en: "Read the analysis" },
    filtersToggle: { fr: "Filtres", en: "Filters" },
    sortRecent: { fr: "Tri · récent", en: "Sort · recent" },
    decisionBrief: { fr: "L’arbitrage en bref", en: "The trade-off in brief" },
    continueSeries: { fr: "Continuer la série", en: "Continue the series" },
    continueEmpty: {
      fr: "Pas de lecture forcée « du même pilier ». Retour à la bibliothèque.",
      en: "No forced “same pillar” recommendations. Back to the library.",
    },
    backToLibrary: { fr: "Toutes les publications", en: "All writing" },
    about: { fr: "À propos", en: "About" },
    work: { fr: "Accompagnement", en: "Advisory" },
    contactPage: { fr: "M’écrire", en: "Get in touch" },
    linkedin: { fr: "LinkedIn", en: "LinkedIn" },
    seriesPart: { fr: "Série", en: "Series" },
    publishedCount: { fr: "publié", en: "published" },
    publishedCountPlural: { fr: "publiés", en: "published" },
    textsCount: { fr: "textes", en: "pieces" },
    toTop: { fr: "Haut de page", en: "Back to top" },
    readingProgress: { fr: "Progression de lecture", en: "Reading progress" },
  } as Record<string, Localized>,
  /** Reuse Start Here editorial reading paths. */
  readingPaths: startHereConfig.learningPaths,
} as const;

export const thinkingPillars = Object.keys(thinkingConfig.pillarLabels) as ThinkingPillar[];

export const thinkingContentTypes = Object.keys(
  thinkingConfig.contentTypeLabels
) as ThinkingContentType[];
