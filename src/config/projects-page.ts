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
    title: { fr: "Projects", en: "Projects" },
    description: {
      fr: "Portfolio technique : open source, cartographie de systèmes, cloud, Kubernetes, observabilité et Platform Engineering.",
      en: "Technical portfolio: open source, systems mapping, cloud, Kubernetes, observability and Platform Engineering.",
    },
    eyebrow: { fr: "Portfolio technique", en: "Technical portfolio" },
    intro: {
      fr: "Projets techniques, open source et de recherche appliquée. Chaque entrée décrit un problème, une approche, des technologies et un statut vérifiable — sans success story ni métriques inventées.",
      en: "Technical, open-source and applied-research projects. Each entry describes a problem, an approach, technologies and a verifiable status — no success story or invented metrics.",
    },
  },
  labels: {
    problem: { fr: "Problème traité", en: "Problem addressed" },
    approach: { fr: "Approche", en: "Approach" },
    technologies: { fr: "Technologies", en: "Technologies" },
    context: { fr: "Contexte", en: "Context" },
    role: { fr: "Rôle d’Etienne", en: "Etienne’s role" },
    principles: { fr: "Principes de conception", en: "Design principles" },
    decisions: { fr: "Décisions", en: "Decisions" },
    whatExists: { fr: "Ce qui existe réellement", en: "What actually exists" },
    currentState: { fr: "État actuel", en: "Current state" },
    proofs: { fr: "Lien public", en: "Public link" },
    limitations: { fr: "Limites", en: "Limits" },
    learnings: { fr: "Apprentissages", en: "Learnings" },
    related: { fr: "Contenus associés", en: "Related content" },
    entityLink: { fr: "Ouvrir", en: "Open" },
    repositoryLink: { fr: "Repository", en: "Repository" },
    read: { fr: "Lire", en: "Read" },
    open: { fr: "Ouvrir", en: "Open" },
    status: { fr: "Statut", en: "Status" },
    back: { fr: "← Projects", en: "← Projects" },
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
