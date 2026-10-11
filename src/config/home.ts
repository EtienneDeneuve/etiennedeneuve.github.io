/**
 * Home-only UI copy. Shared identity / role / positioning live in site.ts
 * and messaging.ts — reference them from the component, do not duplicate here.
 * FR source of truth for approach / technicalDepth: docs/branding/cto-cursor-kit/content.fr.json
 */

export type HomeLocaleCopy = {
  eyebrow: string;
  tagline: string;
  lede: string;
  ctaMission: string;
  ctaMissionExternalHint: string;
  domains: readonly string[];
  approach: {
    eyebrow: string;
    titleFirst: string;
    titleSecond: string;
    intro: string;
    steps: readonly { number: string; title: string; body: string }[];
    completeLabel: string;
    completePath: string;
  };
  technicalDepth: {
    title: string;
    body: string;
    cta: string;
    ctaPath: string;
  };
  publicationsTitle: string;
  publicationsAll: string;
  publicationsEmpty: string;
  readArticle: string;
  portraitAlt: string;
};

export const homeConfig: { fr: HomeLocaleCopy; en: HomeLocaleCopy } = {
  fr: {
    eyebrow: "Conseil aux directions et aux équipes",
    tagline: "Relier les enjeux de l’entreprise, les équipes et la technologie.",
    lede: "Comprendre les causes, éclairer les arbitrages et accompagner les transformations, avec une lecture fine des organisations et des systèmes.",
    ctaMission: "Échanger sur vos enjeux",
    ctaMissionExternalHint: "↗",
    domains: [
      "Stratégie & gouvernance",
      "Organisation & responsabilités",
      "Architecture & logiciel",
      "Production & qualité de service",
    ],
    approach: {
      eyebrow: "Une lecture transverse",
      titleFirst: "Comprendre les causes.",
      titleSecond: "Choisir le bon levier.",
      intro:
        "Chaque situation appelle sa réponse : clarifier une décision, faire évoluer l’organisation ou adapter les systèmes.",
      steps: [
        {
          number: "01",
          title: "Comprendre la situation",
          body: "Écouter les équipes et distinguer les causes humaines, organisationnelles et techniques.",
        },
        {
          number: "02",
          title: "Éclairer les choix",
          body: "Rendre les options, les responsabilités et les conséquences explicites.",
        },
        {
          number: "03",
          title: "Accompagner la trajectoire",
          body: "Guider les équipes, challenger les choix et ajuster les orientations.",
        },
      ],
      completeLabel: "Voir l’accompagnement",
      completePath: "/work/",
    },
    technicalDepth: {
      title: "La profondeur technique, au service du discernement.",
      body: "Du logiciel à la production, comprendre le terrain pour mieux conseiller.",
      cta: "Réalisations & retours d’expérience",
      ctaPath: "/projects/",
    },
    publicationsTitle: "Publications",
    publicationsAll: "Tout lire",
    publicationsEmpty: "",
    readArticle: "Lire l’article",
    portraitAlt: "Portrait d’Étienne Deneuve",
  },
  en: {
    eyebrow: "Advisory for leadership and teams",
    tagline: "Connect business stakes, teams and technology.",
    lede: "Understand root causes, clarify trade-offs and support transformations, with a precise reading of organisations and systems.",
    ctaMission: "Discuss your stakes",
    ctaMissionExternalHint: "↗",
    domains: [
      "Strategy & governance",
      "Organisation & accountabilities",
      "Architecture & software",
      "Production & service quality",
    ],
    approach: {
      eyebrow: "A cross-cutting reading",
      titleFirst: "Understand the causes.",
      titleSecond: "Choose the right lever.",
      intro:
        "Each situation calls for its own response: clarify a decision, evolve the organisation, or adapt the systems.",
      steps: [
        {
          number: "01",
          title: "Understand the situation",
          body: "Listen to teams and separate human, organisational and technical causes.",
        },
        {
          number: "02",
          title: "Clarify the choices",
          body: "Make options, accountabilities and consequences explicit.",
        },
        {
          number: "03",
          title: "Support the trajectory",
          body: "Guide teams, challenge choices and adjust direction.",
        },
      ],
      completeLabel: "See advisory",
      completePath: "/work/",
    },
    technicalDepth: {
      title: "Technical depth, in service of discernment.",
      body: "From software to production — understand the ground to advise better.",
      cta: "Projects & experience reports",
      ctaPath: "/en/projects/",
    },
    publicationsTitle: "Publications",
    publicationsAll: "Read all",
    publicationsEmpty:
      "No English notes yet. The Thinking index has the full library, mostly in French.",
    readArticle: "Read the article",
    portraitAlt: "Portrait of Étienne Deneuve",
  },
} as const;
