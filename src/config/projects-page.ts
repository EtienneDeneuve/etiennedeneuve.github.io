type Localized<T> = { fr: T; en: T };

export const projectsPageConfig = {
  meta: {
    title: { fr: "Projects", en: "Projects" },
    description: {
      fr: "Page de preuves : entités, produits et open source. Problème, décisions, système, limites.",
      en: "Proof page: entities, products and open source. Problem, decisions, system, limits.",
    },
    eyebrow: { fr: "Preuves publiques", en: "Public proof" },
    intro: {
      fr: "Chaque entrée documente un problème réel, les décisions prises, ce qui existe aujourd’hui et ce qui n’est pas encore publiable. Pas de success story : un historique vérifiable.",
      en: "Each entry documents a real problem, decisions made, what exists today and what is not yet publishable. No success story: a verifiable track record.",
    },
  },
  labels: {
    problem: { fr: "Problème observé", en: "Observed problem" },
    context: { fr: "Contexte", en: "Context" },
    role: { fr: "Rôle d’Etienne", en: "Etienne’s role" },
    principles: { fr: "Principes de conception", en: "Design principles" },
    decisions: { fr: "Décisions", en: "Decisions" },
    whatExists: { fr: "Ce qui existe réellement", en: "What actually exists" },
    currentState: { fr: "État actuel", en: "Current state" },
    proofs: { fr: "Preuves", en: "Proof" },
    limitations: { fr: "Limites", en: "Limits" },
    learnings: { fr: "Apprentissages", en: "Learnings" },
    related: { fr: "Contenus associés", en: "Related content" },
    entityLink: { fr: "Voir l’entité", en: "View entity" },
    repositoryLink: { fr: "Repository", en: "Repository" },
    read: { fr: "Lire", en: "Read" },
    open: { fr: "Ouvrir", en: "Open" },
    status: { fr: "Statut", en: "Status" },
    back: { fr: "← Projects", en: "← Projects" },
  },
  ecosystem: {
    title: { fr: "Écosystème", en: "Ecosystem" },
    nodes: [
      {
        id: "taous",
        name: { fr: "Taous", en: "Taous" },
        role: { fr: "cofondatrice", en: "co-founder" },
        href: "/about/#with-taous",
      },
      {
        id: "omnivya",
        name: { fr: "Omnivya", en: "Omnivya" },
        role: { fr: "exécution", en: "execution" },
        href: "/projects/omnivya/",
      },
      {
        id: "sanad",
        name: { fr: "Sanad", en: "Sanad" },
        role: { fr: "outil — IT Challenge", en: "tool — IT Challenge" },
        href: "/projects/sanad/",
      },
      {
        id: "my-dare",
        name: { fr: "My Dare", en: "My Dare" },
        role: { fr: "coworking Alger", en: "Algiers coworking" },
        href: "/projects/my-dare/",
      },
      {
        id: "open-source",
        name: { fr: "Open source", en: "Open source" },
        role: { fr: "preuves publiques", en: "public proof" },
        href: "/projects/external-metrics-exporter/",
      },
    ] satisfies Array<{
      id: string;
      name: Localized<string>;
      role: Localized<string>;
      href: string;
    }>,
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
