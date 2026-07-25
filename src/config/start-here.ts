import type { ContentReference } from "../lib/resolve-content.ts";

type Localized<T> = { fr: T; en: T };

export type LearningPathDefinition = {
  id: string;
  title: Localized<string>;
  summary: Localized<string>;
  themes: Localized<string[]>;
  items: ContentReference[];
};

export const startHereConfig = {
  meta: {
    title: { fr: "Start Here", en: "Start Here" } as Localized<string>,
    description: {
      fr: "Pourquoi faire appel à Etienne Deneuve sur des plateformes et SI complexes : expertise, méthode et preuves publiques.",
      en: "Why Etienne Deneuve for complex platforms and IT estates: expertise, method and public proof.",
    } as Localized<string>,
    eyebrow: {
      fr: "Point d’entrée",
      en: "Entry point",
    } as Localized<string>,
    intro: {
      fr: "Architecte, CTO et conseiller technique sur le cloud, Kubernetes, le Platform Engineering, l’observabilité, le DevSecOps et l’architecture de systèmes complexes.",
      en: "Architect, CTO and technical advisor on cloud, Kubernetes, Platform Engineering, observability, DevSecOps and complex systems architecture.",
    } as Localized<string>,
    lead: {
      fr: "Cette page répond à une question simple : pourquoi suis-je crédible pour intervenir sur des plateformes et des systèmes d’information complexes ?",
      en: "This page answers a simple question: why am I credible to intervene on complex platforms and information systems?",
    } as Localized<string>,
  },
  sections: {
    problems: {
      title: { fr: "Problèmes traités", en: "Problems I address" },
      items: {
        fr: [
          "Des systèmes devenus difficiles à comprendre dans leur ensemble.",
          "Des dépendances invisibles qui rendent chaque changement risqué.",
          "Des risques mal priorisés, traités trop tard ou au mauvais endroit.",
          "Des plateformes qui accumulent les outils sans améliorer le delivery.",
          "Une observabilité inutilisable pour décider : beaucoup de signaux, peu d’action.",
          "Des architectures qui ralentissent le changement au lieu de le sécuriser.",
        ],
        en: [
          "Systems that have become hard to understand as a whole.",
          "Invisible dependencies that make every change risky.",
          "Risks poorly prioritized, addressed too late or in the wrong place.",
          "Platforms that accumulate tools without improving delivery.",
          "Observability that cannot support decisions: many signals, little action.",
          "Architectures that slow change instead of making it safer.",
        ],
      },
    },
    method: {
      title: { fr: "Méthode", en: "Method" },
      intro: {
        fr: "Une trajectoire simple, itérative. Un système vivant ne devient pas parfait au premier déploiement.",
        en: "A simple, iterative path. A living system does not become perfect on the first deployment.",
      },
      steps: {
        fr: [
          "Comprendre le système réel",
          "Cartographier les dépendances",
          "Prioriser les risques",
          "Définir une trajectoire",
          "Accompagner ou construire",
          "Observer, apprendre et itérer",
        ],
        en: [
          "Understand the real system",
          "Map the dependencies",
          "Prioritize the risks",
          "Define a trajectory",
          "Advise or build",
          "Observe, learn and iterate",
        ],
      },
    },
    domains: {
      title: { fr: "Domaines d’intervention", en: "Areas of intervention" },
      items: {
        fr: [
          "Architecture cloud",
          "Kubernetes",
          "Plateformes internes",
          "Observabilité et fiabilité",
          "DevSecOps",
          "Supply chain logicielle",
          "Cartographie des dépendances",
          "Gouvernance technique",
        ],
        en: [
          "Cloud architecture",
          "Kubernetes",
          "Internal platforms",
          "Observability and reliability",
          "DevSecOps",
          "Software supply chain",
          "Dependency mapping",
          "Technical governance",
        ],
      },
    },
    omnivyaRole: {
      title: { fr: "Omnivya", en: "Omnivya" },
      paragraphs: {
        fr: [
          "Je suis cofondateur et CTO d’Omnivya. Les missions nécessitant une capacité de delivery structurée sont portées par Omnivya Expert.",
        ],
        en: [
          "I am co-founder and CTO of Omnivya. Missions that need structured delivery capacity are carried by Omnivya Expert.",
        ],
      },
    },
    featuredProjects: {
      title: {
        fr: "Preuves publiques — projets",
        en: "Public proof — projects",
      },
      intro: {
        fr: "Projets techniques et open source publiés sur ce site. Pas de catalogue commercial.",
        en: "Technical and open-source projects published on this site. Not a commercial catalog.",
      },
      items: [{ kind: "project", id: "external-metrics-exporter" }] satisfies ContentReference[],
    },
    starterContent: {
      title: { fr: "Preuves publiques — écrits", en: "Public proof — writing" },
      intro: {
        fr: "Doctrines et guides qui montrent le raisonnement avant d’aller plus loin.",
        en: "Doctrine and guides that show the reasoning before going further.",
      },
      items: [
        {
          kind: "article",
          id: "2026-07-13-de-la-metrique-au-runbook",
          labelKey: "doctrine",
        },
        {
          kind: "article",
          id: "2024-09-16-managed-identities",
          labelKey: "technicalGuide",
        },
        {
          kind: "article",
          id: "2023-07-28-megalinter-azure-devops",
          labelKey: "technicalGuide",
        },
        {
          kind: "article",
          id: "2018-06-26-documentation-as-code",
          labelKey: "technicalGuide",
        },
      ] as Array<ContentReference & { labelKey: string }>,
    },
    continue: {
      title: { fr: "Où continuer", en: "Where to continue" },
      options: {
        fr: [
          {
            label: "Thinking",
            href: "/thinking/",
            description: "Doctrine, notes de terrain et décisions d’architecture.",
            cta: "Lire",
          },
          {
            label: "Work",
            href: "/work/",
            description: "Modes d’intervention : Diagnose, Decide, Build.",
            cta: "Voir",
          },
          {
            label: "Projects",
            href: "/projects/",
            description: "Preuves techniques et open source.",
            cta: "Voir",
          },
          {
            label: "About",
            href: "/about/",
            description: "Parcours et principes de travail.",
            cta: "Lire",
          },
          {
            label: "Contact",
            href: "/contact/",
            description: "Parler d’un contexte avant d’engager.",
            cta: "Écrire",
          },
        ],
        en: [
          {
            label: "Thinking",
            href: "/en/thinking/",
            description: "Doctrine, field notes and architecture decisions.",
            cta: "Read",
          },
          {
            label: "Work",
            href: "/en/work/",
            description: "Intervention modes: Diagnose, Decide, Build.",
            cta: "View",
          },
          {
            label: "Projects",
            href: "/en/projects/",
            description: "Technical and open-source proof.",
            cta: "View",
          },
          {
            label: "About",
            href: "/en/about/",
            description: "Background and working principles.",
            cta: "Read",
          },
          {
            label: "Contact",
            href: "/en/contact/",
            description: "Talk through a context before engaging.",
            cta: "Write",
          },
        ],
      },
    },
  },
  /** Shared with Thinking index — keep technical paths only. */
  learningPaths: [
    {
      id: "platform-ops",
      title: {
        fr: "Plateforme et opérations",
        en: "Platform and operations",
      },
      summary: {
        fr: "Pour les équipes qui construisent et opèrent des plateformes cloud native.",
        en: "For teams building and operating cloud native platforms.",
      },
      themes: {
        fr: ["Kubernetes", "observabilité", "GitOps", "CI/CD", "opérations"],
        en: ["Kubernetes", "observability", "GitOps", "CI/CD", "operations"],
      },
      items: [
        { kind: "project", id: "external-metrics-exporter" },
        { kind: "article", id: "2026-07-13-de-la-metrique-au-runbook" },
        { kind: "article", id: "2024-09-16-managed-identities" },
        { kind: "article", id: "2023-07-28-megalinter-azure-devops" },
        { kind: "article", id: "2018-06-26-documentation-as-code" },
      ],
    },
    {
      id: "systems-risk",
      title: {
        fr: "Systèmes et risque",
        en: "Systems and risk",
      },
      summary: {
        fr: "Pour reprendre la main sur dépendances, décisions et coût du changement.",
        en: "For regaining control over dependencies, decisions and cost of change.",
      },
      themes: {
        fr: ["risque", "dépendances", "architecture", "supply chain", "gouvernance"],
        en: ["risk", "dependencies", "architecture", "supply chain", "governance"],
      },
      items: [
        { kind: "article", id: "2023-07-28-megalinter-azure-devops" },
        { kind: "article", id: "2018-06-26-documentation-as-code" },
        { kind: "article", id: "2024-09-16-managed-identities" },
        { kind: "resource", id: "DevSecOps" },
      ],
    },
  ] satisfies LearningPathDefinition[],
  contentTypeLabels: {
    doctrine: { fr: "Doctrine", en: "Doctrine" },
    fieldNote: { fr: "Note terrain", en: "Field note" },
    architectureDecision: { fr: "Décision d’architecture", en: "Architecture decision" },
    technicalGuide: { fr: "Guide technique", en: "Technical guide" },
  } as Record<string, Localized<string>>,
} as const;
