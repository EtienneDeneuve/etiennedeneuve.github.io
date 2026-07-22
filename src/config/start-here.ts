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
      fr: "Orientation en cinq minutes : doctrine, problèmes, raisonnement, preuves et parcours éditoriaux.",
      en: "Five-minute orientation: doctrine, problems, reasoning, proof and editorial paths.",
    } as Localized<string>,
    eyebrow: {
      fr: "5 minutes pour comprendre",
      en: "5 minutes to understand",
    } as Localized<string>,
    intro: {
      fr: "Cette page résume comment je raisonne, ce que je construis, et où commencer selon votre contexte, sans catalogue d’outils ni promesses chiffrées.",
      en: "This page summarizes how I reason, what I build, and where to start based on your context, without a tool catalog or unverified metrics.",
    } as Localized<string>,
  },
  sections: {
    whatIBuild: {
      title: { fr: "Ce que je construis", en: "What I build" },
      paragraphs: {
        fr: [
          "Des systèmes lisibles : cartographies, modèles de décision et feuilles de route plateforme qui rendent le SI pilotable.",
          "Des composants opérables : Omnivya, My Dare (coworking), Sanad (outil via IT Challenge / Omnivya Expert), plus l’open source, chacun ancré dans une contrainte réelle.",
          "Des cadres de gouvernance : sécurité intégrée au cycle de vie, observabilité utile, réduction de la charge cognitive, plutôt que des dashboards de plus.",
        ],
        en: [
          "Readable systems: mappings, decision models and platform trajectories that make the IT estate governable.",
          "Operable components: Omnivya, My Dare (coworking), Sanad (tool via IT Challenge / Omnivya Expert), plus open source, each anchored in a real constraint.",
          "Governance frameworks: security embedded in the lifecycle, useful observability, reduced cognitive load, rather than more dashboards.",
        ],
      },
    },
    problems: {
      title: { fr: "Les problèmes auxquels je m’intéresse", en: "The problems I care about" },
      items: {
        fr: [
          "Personne ne sait plus qui dépend de quoi, ni où prioriser le risque.",
          "Les équipes déploient, mais chaque modification augmente une dette qu’on ne voit plus.",
          "Cloud et plateforme ne livrent pas : golden paths absents, self-service illusoire.",
          "On empile les outils sans pouvoir trancher plus vite ; la gouvernance reste sur papier.",
        ],
        en: [
          "Nobody can explain who depends on what, or where to prioritize risk.",
          "Teams ship, but every change grows debt that no longer shows up clearly.",
          "Cloud and platform bets miss: missing golden paths, illusory self-service.",
          "Tool catalogs grow while decisions stay slow; governance stays on paper.",
        ],
      },
    },
    reasoning: {
      title: { fr: "Ma manière de raisonner", en: "How I reason" },
      principles: {
        fr: [
          "Comprendre avant d’automatiser : cartographier le système et ses contraintes réelles.",
          "Modéliser les dépendances et le risque, pas seulement les composants techniques.",
          "Réduire la charge cognitive : chaque artefact doit aider une décision concrète.",
          "Construire pour les contraintes réelles : réglementaires, organisationnelles, territoriales.",
        ],
        en: [
          "Understand before automating: map the system and its real constraints.",
          "Model dependencies and risk, not just technical components.",
          "Reduce cognitive load: every artifact must support a concrete decision.",
          "Build for real constraints: regulatory, organizational, territorial.",
        ],
      },
    },
    omnivyaRole: {
      title: { fr: "Le rôle d’Omnivya", en: "The role of Omnivya" },
      paragraphs: {
        fr: [
          "Ce site exprime mon raisonnement et mes preuves publiques. Omnivya est l’entité d’exécution : conseil, construction de plateformes, transformation DevSecOps, missions cloud native et Kubernetes.",
          "Quand une mission demande de l’exécution structurée plutôt qu’un échange de principes, c’est Omnivya qui porte la delivery, avec les mêmes exigences de lisibilité et de gouvernabilité.",
        ],
        en: [
          "This site expresses my reasoning and public proof. Omnivya is the execution entity: consulting, platform building, DevSecOps transformation, cloud native and Kubernetes missions.",
          "When a mission requires structured execution rather than a principles discussion, Omnivya carries delivery, with the same readability and governability bar.",
        ],
      },
    },
    proofs: {
      title: {
        fr: "Les produits et expériences qui servent de preuves",
        en: "Products and experiences that serve as proof",
      },
      intro: {
        fr: "Chaque preuve répond à un problème documenté. Les métadonnées proviennent des collections, pas de claims inventés.",
        en: "Each proof addresses a documented problem. Metadata comes from collections, no invented claims.",
      },
      items: [
        { kind: "project", id: "sanad" },
        { kind: "project", id: "my-dare" },
        { kind: "project", id: "external-metrics-exporter" },
      ] satisfies ContentReference[],
    },
    starterContent: {
      title: { fr: "Les meilleurs contenus pour commencer", en: "Best content to start with" },
      intro: {
        fr: "Quatre types de contenu pour comprendre la doctrine avant d’aller plus loin.",
        en: "Four content types to understand the doctrine before going further.",
      },
      items: [
        { kind: "article", id: "2024-02-11-zero-trust-overview", labelKey: "doctrine" },
        {
          kind: "article",
          id: "2024-10-05-automatisation-carousel-linkedin",
          labelKey: "fieldNote",
        },
        {
          kind: "article",
          id: "2023-07-28-megalinter-azure-devops",
          labelKey: "architectureDecision",
        },
        { kind: "article", id: "2024-09-16-managed-identities", labelKey: "technicalGuide" },
      ] as Array<ContentReference & { labelKey: string }>,
    },
    continue: {
      title: { fr: "Les différentes manières de poursuivre", en: "Ways to continue" },
      options: {
        fr: [
          {
            label: "Explorer Thinking",
            href: "/thinking/",
            description: "Doctrine, notes de terrain et décisions d’architecture.",
          },
          {
            label: "Ouvrir Work",
            href: "/work/",
            description: "Missions, case studies et contextes d’intervention.",
          },
          {
            label: "Voir les projets",
            href: "/projects/",
            description: "Produits, open source et expériences vérifiables.",
          },
          {
            label: "Parler d’un système complexe",
            href: "/contact/",
            description: "Qualifier un contexte avant engagement.",
          },
        ],
        en: [
          {
            label: "Explore Thinking",
            href: "/en/thinking/",
            description: "Doctrine, field notes and architecture decisions.",
          },
          {
            label: "Open Work",
            href: "/en/work/",
            description: "Missions, case studies and intervention contexts.",
          },
          {
            label: "View projects",
            href: "/en/projects/",
            description: "Products, open source and verifiable experiences.",
          },
          {
            label: "Discuss a complex system",
            href: "/en/contact/",
            description: "Qualify a context before engagement.",
          },
        ],
      },
    },
  },
  learningPaths: [
    {
      id: "technical-leader",
      title: {
        fr: "Dirigeant technique",
        en: "Technical leader",
      },
      summary: {
        fr: "Pour CTO, CIO, CISO et leads qui reprennent le contrôle d’un système complexe.",
        en: "For CTOs, CIOs, CISOs and leads taking back control of a complex system.",
      },
      themes: {
        fr: [
          "risque",
          "maîtrise du système",
          "décisions d’architecture",
          "dépendances",
          "coût du changement",
        ],
        en: ["risk", "system control", "architecture decisions", "dependencies", "cost of change"],
      },
      items: [
        { kind: "article", id: "2024-02-11-zero-trust-overview" },
        { kind: "article", id: "2024-02-15-zero-trust-tl-dr" },
        { kind: "article", id: "2023-07-28-megalinter-azure-devops" },
        { kind: "article", id: "2020-02-07-infra-testing-easy-path" },
        { kind: "article", id: "2020-02-17-infra-testing-easy-path-2" },
      ],
    },
    {
      id: "platform-sre",
      title: {
        fr: "Platform / SRE",
        en: "Platform / SRE",
      },
      summary: {
        fr: "Pour les équipes qui construisent et opèrent des plateformes cloud native.",
        en: "For teams building and operating cloud native platforms.",
      },
      themes: {
        fr: ["Kubernetes", "observabilité", "platform engineering", "CI/CD", "opérations"],
        en: ["Kubernetes", "observability", "platform engineering", "CI/CD", "operations"],
      },
      items: [
        { kind: "project", id: "external-metrics-exporter" },
        { kind: "article", id: "2024-09-16-managed-identities" },
        { kind: "article", id: "2017-10-09-vsts-for-ops-1" },
        { kind: "article", id: "2017-10-13-vsts-for-ops-2" },
        { kind: "article", id: "2017-10-25-vsts-for-ops-part-3" },
        { kind: "article", id: "2018-06-26-documentation-as-code" },
        { kind: "article", id: "2020-06-19-anf-rbac" },
      ],
    },
    {
      id: "security-supply-chain",
      title: {
        fr: "Sécurité et supply chain",
        en: "Security and supply chain",
      },
      summary: {
        fr: "Pour les contextes où sécurité, conformité et chaîne logicielle sont indissociables.",
        en: "For contexts where security, compliance and the software chain are inseparable.",
      },
      themes: {
        fr: ["SBOM", "dépendances", "secrets", "DevSecOps", "analyse de risque"],
        en: ["SBOM", "dependencies", "secrets", "DevSecOps", "risk analysis"],
      },
      items: [
        { kind: "resource", id: "DevSecOps" },
        { kind: "article", id: "2024-02-12-zero-trust-microsoft" },
        { kind: "article", id: "2024-02-14-zero-trust-open-source" },
        { kind: "article", id: "2024-02-13-zero-trust-google" },
        { kind: "article", id: "2024-09-16-managed-identities" },
        { kind: "article", id: "2023-07-28-megalinter-azure-devops" },
      ],
    },
    {
      id: "product-complex-markets",
      title: {
        fr: "Terrain Algérie & outils locaux",
        en: "Algeria field & local tools",
      },
      summary: {
        fr: "Pour ceux qui construisent sous contraintes locales — coworking, filiale, outil métier — sans surjouer le discours produit.",
        en: "For those building under local constraints — coworking, subsidiary, business tool — without overplaying product narrative.",
      },
      themes: {
        fr: [
          "My Dare",
          "IT Challenge",
          "Omnivya Expert",
          "contraintes locales",
          "construction depuis le terrain",
        ],
        en: [
          "My Dare",
          "IT Challenge",
          "Omnivya Expert",
          "local constraints",
          "building from the field",
        ],
      },
      items: [
        { kind: "project", id: "my-dare" },
        { kind: "project", id: "sanad" },
        { kind: "project", id: "omnivya" },
        { kind: "article", id: "2018-06-26-documentation-as-code" },
      ],
    },
  ] satisfies LearningPathDefinition[],
  contentTypeLabels: {
    doctrine: { fr: "Doctrine", en: "Doctrine" },
    fieldNote: { fr: "Field note", en: "Field note" },
    architectureDecision: { fr: "Décision d’architecture", en: "Architecture decision" },
    technicalGuide: { fr: "Guide technique", en: "Technical guide" },
  } as Record<string, Localized<string>>,
} as const;
