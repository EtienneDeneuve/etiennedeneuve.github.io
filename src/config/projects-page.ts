type Localized<T> = { fr: T; en: T };

/** Project types shown on the public /projects/ portfolio. */
export const portfolioProjectTypes = [
  "open-source",
  "product",
  "experiment",
  "client-work",
] as const;

export function isPortfolioProject(entry: {
  id: string;
  data: { type: string; draft?: boolean };
}): boolean {
  const allowedTypes = new Set<string>(portfolioProjectTypes);
  return allowedTypes.has(entry.data.type) && entry.data.draft !== true;
}

export const projectsPageConfig = {
  meta: {
    title: { fr: "Réalisations", en: "Selected work" },
    description: {
      fr: "Projets et contributions publics : problèmes traités, choix d'ingénierie, code disponible et limites réelles.",
      en: "Public projects and contributions: the problems addressed, engineering decisions, available code and real limitations.",
    },
    eyebrow: { fr: "CTO expert · Preuves", en: "Hands-on CTO · Evidence" },
    headline: {
      fr: "Ce que j'ai construit. Et pourquoi.",
      en: "What I built. And why.",
    },
    intro: {
      fr: "Une sélection de projets documentés, de composants open source et de retours de terrain. Les choix, les compromis et les limites comptent davantage qu'une liste de technologies.",
      en: "Selected projects, open-source components and field reports. The choices, trade-offs and limitations matter more than a catalogue of technologies.",
    },
    asideLabel: { fr: "Ce qui compte", en: "What matters" },
    aside: {
      fr: "Je distingue ici les réalisations publiques des missions clients. Un dépôt peut démontrer une façon de travailler ; il ne remplace pas un résultat client documenté et autorisé.",
      en: "I distinguish public work from client engagements. A repository can show how I work; it does not replace a documented and approved client outcome.",
    },
    asideLink: { fr: "Lire les publications", en: "Read the field notes" },
    featuredIntro: {
      fr: "Une lecture du problème, de l'approche et de ce qui existe réellement. Pas de cas client inventé.",
      en: "The problem, the approach and what actually exists. No invented client success stories.",
    },
    fieldReportsTitle: {
      fr: "La technique confrontée au terrain",
      en: "Engineering meets the real world",
    },
    fieldReportsIntro: {
      fr: "Deux retours d'expérience où l'approche habituelle a été reconsidérée, avec les équipes et sous contraintes réelles.",
      en: "Two field reports where an established approach was challenged with the teams, under real constraints.",
    },
    fieldReports: [
      {
        title: {
          fr: "OpenTelemetry sur environ 200 services",
          en: "OpenTelemetry across roughly 200 services",
        },
        description: {
          fr: "Instrumenter un système historique sans engager une refonte générale.",
          en: "Instrumenting a long-lived system without turning the work into a broad rewrite.",
        },
        href: "/thinking/2026-09-22-opentelemetry-instrumenter-200-services/",
        label: { fr: "REX · Observabilité", en: "Field report · Observability" },
      },
      {
        title: {
          fr: "La CI locale face aux agents IA",
          en: "Local-first CI alongside AI agents",
        },
        description: {
          fr: "Raccourcir la boucle de validation tout en maintenant les contrôles de merge.",
          en: "Shortening the feedback loop while retaining merge quality gates.",
        },
        href: "/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre/",
        label: { fr: "REX · Engineering", en: "Field report · Engineering" },
      },
    ],
    fieldReportsNote: {
      fr: "Ces articles décrivent des expériences et leurs limites, pas des gains garantis.",
      en: "These articles describe experiments and their limits, not guaranteed outcomes.",
    },
    contactTitle: {
      fr: "Un problème mérite mieux qu'un catalogue de technos.",
      en: "A real problem deserves more than a technology catalogue.",
    },
    contactBody: {
      fr: "Si l'un de ces choix résonne avec votre situation, parlons du problème avant de présumer de la solution.",
      en: "If one of these choices speaks to your situation, start with the problem before assuming the solution.",
    },
    contactLabel: { fr: "Prendre contact", en: "Get in touch" },
  },
  labels: {
    featured: { fr: "Projets documentés", en: "Documented projects" },
    other: { fr: "Autres contributions publiques", en: "Other public contributions" },
    empty: {
      fr: "Aucun projet publié pour le moment.",
      en: "No published project yet.",
    },
    problem: { fr: "Problème rencontré", en: "Problem faced" },
    approach: { fr: "Approche", en: "Approach" },
    technologies: { fr: "Technologies", en: "Technologies" },
    context: { fr: "Contexte", en: "Context" },
    role: { fr: "Rôle", en: "Role" },
    principles: { fr: "Principes de conception", en: "Design principles" },
    decisions: { fr: "Choix structurants", en: "Structural choices" },
    whatExists: { fr: "Fonctionnement", en: "How it works" },
    currentState: { fr: "État actuel", en: "Current state" },
    proofs: { fr: "Dépôt", en: "Repository" },
    limitations: { fr: "Limites concrètes", en: "Concrete limits" },
    learnings: { fr: "Apprentissages", en: "Learnings" },
    related: { fr: "Contenus associés", en: "Related content" },
    entityLink: { fr: "Ouvrir", en: "Open" },
    repositoryLink: { fr: "Dépôt", en: "Repository" },
    read: { fr: "Lire", en: "Read" },
    open: { fr: "Ouvrir", en: "Open" },
    status: { fr: "Statut", en: "Status" },
    back: { fr: "← Réalisations", en: "← Selected work" },
  },
  statusLabels: {
    idea: { fr: "Idée", en: "Idea" },
    alpha: { fr: "Alpha", en: "Alpha" },
    beta: { fr: "Beta", en: "Beta" },
    production: { fr: "Production", en: "Production" },
    maintenance: { fr: "Maintenance", en: "Maintenance" },
    archived: { fr: "Archivé", en: "Archived" },
  } as Record<string, Localized<string>>,
} as const;
