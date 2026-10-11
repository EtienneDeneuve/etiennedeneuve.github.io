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
      fr: "Quelques projets détaillés, puis une liste compacte d’autres contributions publiques.",
      en: "A few detailed projects, then a compact list of other public contributions.",
    },
  },
  labels: {
    featured: { fr: "Mis en avant", en: "Featured" },
    other: { fr: "Autres contributions", en: "Other contributions" },
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
