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
      fr: "Carte d’entrée : qui construit quoi, comment l’écosystème s’est formé, et où lire ensuite.",
      en: "Entry map: who builds what, how the ecosystem formed, and where to read next.",
    } as Localized<string>,
    eyebrow: {
      fr: "Point d’entrée",
      en: "Entry point",
    } as Localized<string>,
    intro: {
      fr: "Ce site documente mon raisonnement. L’écosystème Omnivya s’est formé à partir de besoins réels, pas d’un plan d’expansion.",
      en: "This site documents my reasoning. The Omnivya ecosystem formed from real needs, not from an expansion plan.",
    } as Localized<string>,
  },
  sections: {
    map: {
      title: { fr: "La carte, pas le catalogue", en: "The map, not the catalog" },
      intro: {
        fr: "Chaque branche répond à une contrainte. Omnivya rassemble le tout pour unifier les process, pas pour inventer une holding.",
        en: "Each arm answers a constraint. Omnivya brings it together to unify processes, not to invent a holding company.",
      },
      founders: [
        {
          id: "taous",
          name: { fr: "Taous", en: "Taous" },
          role: { fr: "cofondatrice", en: "co-founder" },
          href: { fr: "/about/#with-taous", en: "/en/about/#with-taous" },
        },
        {
          id: "etienne",
          name: { fr: "Etienne", en: "Etienne" },
          role: { fr: "cofondateur", en: "co-founder" },
          href: { fr: "/about/", en: "/en/about/" },
        },
      ],
      hub: {
        name: { fr: "Omnivya", en: "Omnivya" },
        role: {
          fr: "Hub du groupe · cadre commun",
          en: "Group hub · shared frame",
        },
        href: { fr: "/projects/omnivya/", en: "/en/projects/omnivya/" },
      },
      arms: [
        {
          id: "omnivya-expert",
          name: { fr: "Omnivya Expert", en: "Omnivya Expert" },
          role: {
            fr: "Conseil, delivery et build en Europe et en Afrique",
            en: "Consulting, delivery and build across Europe and Africa",
          },
          href: { fr: "https://www.omnivya.fr", en: "https://www.omnivya.fr" },
          external: true,
        },
        {
          id: "my-dare",
          name: { fr: "My Dare", en: "My Dare" },
          role: {
            fr: "Coworking premium, domiciliation et lieu de travail à Alger",
            en: "Premium coworking, business address and workplace in Algiers",
          },
          href: { fr: "/projects/my-dare/", en: "/en/projects/my-dare/" },
        },
        {
          id: "sanad",
          name: { fr: "Sanad", en: "Sanad" },
          role: {
            fr: "Devis, factures et contrats pour le marché algérien",
            en: "Quotes, invoices and contracts for the Algerian market",
          },
          href: { fr: "/projects/sanad/", en: "/en/projects/sanad/" },
        },
        {
          id: "open-source",
          name: { fr: "Open source", en: "Open source" },
          role: {
            fr: "Composants publics utiles à la communauté",
            en: "Public components useful to the community",
          },
          href: {
            fr: "/projects/external-metrics-exporter/",
            en: "/en/projects/external-metrics-exporter/",
          },
        },
      ],
    },
    origin: {
      title: {
        fr: "Un écosystème construit à partir de besoins réels",
        en: "An ecosystem built from real needs",
      },
      paragraphs: {
        fr: [
          "Taous et moi avons d’abord créé Simplifi’ED pour porter nos activités de conseil et d’ingénierie.",
          "Nous n’avions pas prévu de nous développer en Algérie. Cette décision est venue plus tard, face à une difficulté très concrète : trouver suffisamment de profils techniques en Europe. Nous avons alors choisi de constituer une équipe en Algérie, où nous pouvions accéder à des compétences solides et construire une capacité de delivery complémentaire.",
          "Pour permettre à cette équipe de travailler dans de bonnes conditions, nous avons créé My Dare. En opérant ce lieu, nous avons constaté qu’aucun SaaS ne répondait correctement aux besoins locaux de devis, de facturation et de gestion contractuelle. Nous avons donc développé Sanad, avec les équipes d’IT Challenge, aujourd’hui intégrées à Omnivya Expert.",
          "Omnivya Expert porte désormais les activités de conseil, de services et de delivery en Europe et en Afrique. Nos composants open source prolongent la même logique : transformer les problèmes rencontrés sur le terrain en solutions réutilisables et les partager avec la communauté.",
          "Aujourd’hui, nous réunissons progressivement cet ensemble sous Omnivya. La raison est simple : nous nous sommes rendu compte que, selon les marques, nous refaisions parfois trois ou quatre fois le même travail. Autant unifier les process, garder des marques spécialisées, et arrêter de dupliquer l’effort.",
          "Chaque branche est née de la précédente. Non pas à partir d’un catalogue d’idées, mais d’un problème réel qu’il fallait résoudre.",
        ],
        en: [
          "Taous and I first built Simplifi’ED to carry our consulting and engineering work.",
          "We had not planned to expand into Algeria. That decision came later, facing a very concrete constraint: finding enough technical profiles in Europe. We then chose to build a team in Algeria, where we could access strong skills and grow complementary delivery capacity.",
          "To let that team work under proper conditions, we built My Dare. Running the place showed that no SaaS properly covered local needs for quotes, invoicing and contract management. So we built Sanad with the IT Challenge teams, now part of Omnivya Expert.",
          "Omnivya Expert now carries consulting, services and delivery across Europe and Africa. Our open-source components follow the same logic: turn field problems into reusable solutions and share them with the community.",
          "Today we are gradually bringing this set together under Omnivya. The reason is simple: we realized that, across brands, we were sometimes doing the same work three or four times. Better to unify processes, keep specialized brands, and stop duplicating effort.",
          "Each branch was born from the previous one. Not from a catalog of ideas, but from a real problem that had to be solved.",
        ],
      },
    },
    whatIBuild: {
      title: { fr: "Ce que je construis ici", en: "What I build here" },
      paragraphs: {
        fr: [
          "Des systèmes lisibles : cartographies, modèles de décision et trajectoires plateforme qui rendent un SI pilotable.",
          "Des projets concrets : chaque bras de l’écosystème (groupe, services, coworking, outil local, open source) convertit un problème en solution ou en opportunité.",
          "Des cadres de gouvernance : sécurité dans le cycle de vie, observabilité utile, moins de charge cognitive, plutôt que des dashboards de plus.",
        ],
        en: [
          "Readable systems: mappings, decision models and platform trajectories that make an IT estate governable.",
          "Concrete projects: each arm of the ecosystem (group, services, coworking, local tool, open source) turns a problem into a solution or an opportunity.",
          "Governance frames: security in the lifecycle, useful observability, less cognitive load, rather than more dashboards.",
        ],
      },
    },
    problems: {
      title: { fr: "Les problèmes auxquels je m’intéresse", en: "The problems I care about" },
      items: {
        fr: [
          "Personne ne sait plus qui dépend de quoi, ni où prioriser le risque.",
          "Les équipes déploient, mais chaque modification augmente une dette qui n’est plus visible.",
          "Cloud et plateforme ne livrent pas : golden paths absents, self-service illusoire.",
          "Les outils s’empilent sans permettre de trancher plus vite ; la gouvernance reste sur papier.",
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
      title: { fr: "Omnivya et Omnivya Expert", en: "Omnivya and Omnivya Expert" },
      paragraphs: {
        fr: [
          "Omnivya rassemble les marques pour unifier les process : nous nous sommes rendu compte que nous refaisions parfois trois ou quatre fois le même travail. Omnivya Expert porte le conseil, les services et la delivery en Europe et en Afrique ; My Dare, Sanad et l’open source gardent leur rôle.",
          "Ce site clarifie le raisonnement. Omnivya Expert porte l’exécution structurée.",
        ],
        en: [
          "Omnivya brings the brands together to unify processes: we realized we were sometimes doing the same work three or four times. Omnivya Expert carries consulting, services and delivery across Europe and Africa; My Dare, Sanad and open source keep their own roles.",
          "This site clarifies the reasoning. Omnivya Expert carries structured execution.",
        ],
      },
    },
    featuredProjects: {
      title: {
        fr: "Projets à voir en premier",
        en: "Projects to see first",
      },
      intro: {
        fr: "Quatre projets qui montrent comment un problème devient une solution ou une opportunité.",
        en: "Four projects that show how a problem becomes a solution or an opportunity.",
      },
      items: [
        { kind: "project", id: "omnivya" },
        { kind: "project", id: "my-dare" },
        { kind: "project", id: "sanad" },
        { kind: "project", id: "external-metrics-exporter" },
      ] satisfies ContentReference[],
    },
    starterContent: {
      title: { fr: "Meilleurs contenus pour commencer", en: "Best content to start with" },
      intro: {
        fr: "Notes récentes et guides qui montrent le raisonnement avant d’aller plus loin.",
        en: "Recent notes and guides that show the reasoning before going further.",
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
          labelKey: "architectureDecision",
        },
        {
          kind: "article",
          id: "2018-06-26-documentation-as-code",
          labelKey: "fieldNote",
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
            label: "Missions et contextes",
            href: "/work/",
            description: "Modes d’intervention et case studies publiables.",
            cta: "Voir",
          },
          {
            label: "Projets",
            href: "/projects/",
            description: "Groupe, terrain Algérie et projets open source.",
            cta: "Voir",
          },
          {
            label: "Contact",
            href: "/contact/",
            description: "Qualifier un contexte avant engagement.",
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
            label: "Missions and contexts",
            href: "/en/work/",
            description: "Intervention modes and publishable case studies.",
            cta: "View",
          },
          {
            label: "Projects",
            href: "/en/projects/",
            description: "Group, Algeria field work and open-source projects.",
            cta: "View",
          },
          {
            label: "Contact",
            href: "/en/contact/",
            description: "Qualify a context before engagement.",
            cta: "Write",
          },
        ],
      },
    },
  },
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
      id: "algeria-field",
      title: {
        fr: "Terrain Algérie",
        en: "Algeria field",
      },
      summary: {
        fr: "Talents, lieu de travail, outil local : la chaîne concrète derrière My Dare et Sanad.",
        en: "Talent, workplace, local tool: the concrete chain behind My Dare and Sanad.",
      },
      themes: {
        fr: ["My Dare", "Sanad", "Omnivya Expert", "IT Challenge", "contraintes locales"],
        en: ["My Dare", "Sanad", "Omnivya Expert", "IT Challenge", "local constraints"],
      },
      items: [
        { kind: "project", id: "omnivya" },
        { kind: "project", id: "my-dare" },
        { kind: "project", id: "sanad" },
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
