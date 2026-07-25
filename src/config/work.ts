import type { ContentReference } from "../lib/resolve-content.ts";

type Localized<T> = { fr: T; en: T };

export type InterventionModeDefinition = {
  id: string;
  title: Localized<string>;
  objective: Localized<string>;
  scopeExamples: Localized<string[]>;
  possibleDeliverables?: Localized<string[]>;
  startingSituation: Localized<string>;
  expectedOutcome: Localized<string>;
  engagementShape: Localized<string>;
  included: Localized<string[]>;
  excluded: Localized<string[]>;
  proofs: ContentReference[];
  cta: {
    label: Localized<string>;
    subject: Localized<string>;
    secondaryLink?: Localized<{ label: string; href: string }>;
  };
};

export const workConfig = {
  meta: {
    title: { fr: "Work", en: "Work" },
    description: {
      fr: "Conseil, architecture et delivery technique : Diagnose, Decide, Build — systèmes complexes, cloud, Kubernetes, observabilité, DevSecOps.",
      en: "Consulting, architecture and technical delivery: Diagnose, Decide, Build — complex systems, cloud, Kubernetes, observability, DevSecOps.",
    },
    eyebrow: {
      fr: "Modes d’intervention",
      en: "Intervention modes",
    },
    intro: {
      fr: "Je n’interviens pas comme un catalogue de prestations. Chaque mission commence par clarifier le mode adapté : comprendre le système, trancher une décision d’architecture, accompagner un CTO, ou construire via Omnivya Expert.",
      en: "I do not operate as a service catalog. Every engagement starts by clarifying the right mode: understand the system, make an architecture decision, advise a CTO, or build via Omnivya Expert.",
    },
  },
  modes: [
    {
      id: "diagnose",
      title: { fr: "Diagnose", en: "Diagnose" },
      objective: {
        fr: "Rendre visible le système, ses dépendances, ses risques et ses contraintes.",
        en: "Make the system, its dependencies, risks and constraints visible.",
      },
      scopeExamples: {
        fr: [
          "architecture de systèmes et cloud",
          "Kubernetes et Platform Engineering",
          "observabilité, fiabilité et opérabilité",
          "DevSecOps et supply chain logicielle",
          "dépendances et risques techniques",
          "gouvernance et flux de décision",
        ],
        en: [
          "systems and cloud architecture",
          "Kubernetes and Platform Engineering",
          "observability, reliability and operability",
          "DevSecOps and software supply chain",
          "dependencies and technical risk",
          "governance and decision flows",
        ],
      },
      possibleDeliverables: {
        fr: [
          "modèle du système",
          "risques priorisés",
          "décisions nécessaires",
          "roadmap",
          "plan d’action exécutable",
        ],
        en: [
          "system model",
          "prioritized risks",
          "required decisions",
          "roadmap",
          "executable action plan",
        ],
      },
      startingSituation: {
        fr: "Le système est devenu opaque : personne ne peut expliquer les dépendances, prioriser le risque, ou relier les choix techniques aux contraintes réelles.",
        en: "The system became opaque: no one can explain dependencies, prioritize risk, or connect technical choices to real constraints.",
      },
      expectedOutcome: {
        fr: "Une représentation partagée du système, des risques priorisés et un plan d’action que l’organisation peut exécuter — sans promesse chiffrée non sourcée.",
        en: "A shared representation of the system, prioritized risks and an action plan the organization can execute — without unsourced numeric promises.",
      },
      engagementShape: {
        fr: "Diagnostic ciblé : entretiens, revue d’architecture, cartographie des dépendances et des flux de décision. Durée et périmètre calibrés au contexte.",
        en: "Focused assessment: interviews, architecture review, dependency and decision-flow mapping. Scope and duration calibrated to context.",
      },
      included: {
        fr: [
          "Cartographie du système et des dépendances",
          "Analyse de risque et contraintes",
          "Backlog de décisions priorisées",
          "Roadmap et plan d’action",
          "Restitution aux parties prenantes",
        ],
        en: [
          "System and dependency mapping",
          "Risk and constraint analysis",
          "Prioritized decision backlog",
          "Roadmap and action plan",
          "Stakeholder readout",
        ],
      },
      excluded: {
        fr: [
          "Implémentation ou delivery technique",
          "Achat ou déploiement d’outils",
          "Staff augmentation sans cadre d’architecture",
          "Métriques commerciales ou gains chiffrés non vérifiés",
        ],
        en: [
          "Implementation or technical delivery",
          "Tool procurement or deployment",
          "Staff augmentation without an architecture frame",
          "Commercial metrics or unverified gain figures",
        ],
      },
      proofs: [
        { kind: "article", id: "2024-02-11-zero-trust-overview" },
        { kind: "project", id: "external-metrics-exporter" },
      ],
      cta: {
        label: { fr: "Qualifier un diagnostic", en: "Qualify a diagnosis" },
        subject: {
          fr: "Demande diagnostic système",
          en: "System diagnosis request",
        },
      },
    },
    {
      id: "decide",
      title: { fr: "Decide", en: "Decide" },
      objective: {
        fr: "Aider les dirigeants et responsables techniques à prendre une décision difficile avec un niveau suffisant de preuve.",
        en: "Help leaders and technical owners make a difficult decision with sufficient evidence.",
      },
      scopeExamples: {
        fr: [
          "choix d’architecture cloud ou Kubernetes",
          "stratégie de plateforme interne",
          "migration cloud ou transformation technique",
          "build versus buy",
          "découpage de systèmes",
          "feuille de route sécurité / DevSecOps",
          "accompagnement CTO sur une décision structurante",
        ],
        en: [
          "cloud or Kubernetes architecture choice",
          "internal platform strategy",
          "cloud migration or technical transformation",
          "build versus buy",
          "system decomposition",
          "security / DevSecOps roadmap",
          "CTO advisory on a structural decision",
        ],
      },
      startingSituation: {
        fr: "Une décision structurante bloque l’organisation : plusieurs options, peu de preuves, et un coût du changement mal compris.",
        en: "A structural decision blocks the organization: multiple options, little evidence, and poorly understood cost of change.",
      },
      expectedOutcome: {
        fr: "Une décision documentée avec trade-offs explicites, critères de choix et niveau de preuve suffisant pour engager l’organisation.",
        en: "A documented decision with explicit trade-offs, selection criteria and sufficient evidence to engage the organization.",
      },
      engagementShape: {
        fr: "Atelier de décision et analyse d’options : ADR, critères, scénarios et recommandation argumentée. Calibré au enjeu, sans durée fixe imposée.",
        en: "Decision workshop and options analysis: ADR, criteria, scenarios and reasoned recommendation. Calibrated to stakes, without imposed fixed duration.",
      },
      included: {
        fr: [
          "Analyse structurée des options",
          "Documentation type ADR",
          "Critères de décision et trade-offs",
          "Recommandation argumentée",
          "Plan de prochaines étapes",
        ],
        en: [
          "Structured options analysis",
          "ADR-style documentation",
          "Decision criteria and trade-offs",
          "Reasoned recommendation",
          "Next-steps plan",
        ],
      },
      excluded: {
        fr: [
          "Delivery de la solution retenue",
          "Négociation commerciale avec éditeurs",
          "Promesse de ROI ou pourcentages de gain",
          "Validation réglementaire formelle (sauf si explicitement cadrée)",
        ],
        en: [
          "Delivery of the chosen solution",
          "Commercial negotiation with vendors",
          "ROI promises or gain percentages",
          "Formal regulatory validation (unless explicitly scoped)",
        ],
      },
      proofs: [
        { kind: "article", id: "2023-07-28-megalinter-azure-devops" },
        { kind: "article", id: "2024-02-15-zero-trust-tl-dr" },
        { kind: "article", id: "2020-02-07-infra-testing-easy-path" },
      ],
      cta: {
        label: { fr: "Qualifier une décision", en: "Qualify a decision" },
        subject: {
          fr: "Demande arbitrage architecture",
          en: "Architecture decision request",
        },
      },
    },
    {
      id: "build",
      title: { fr: "Build", en: "Build" },
      objective: {
        fr: "Transformer la décision en système opérationnel avec Omnivya Expert.",
        en: "Turn the decision into an operational system with Omnivya Expert.",
      },
      scopeExamples: {
        fr: [
          "fondations de plateforme cloud / Kubernetes",
          "GitOps et automatisation du delivery",
          "observabilité et fiabilité",
          "sécurité de la supply chain (DevSecOps)",
          "composants et outils de plateforme interne",
          "prototypes techniques cadrés par une décision",
        ],
        en: [
          "cloud / Kubernetes platform foundations",
          "GitOps and delivery automation",
          "observability and reliability",
          "supply chain security (DevSecOps)",
          "internal platform components and tools",
          "technical prototypes framed by a prior decision",
        ],
      },
      startingSituation: {
        fr: "La direction est prise mais le système n’existe pas encore — ou le legacy empêche l’exécution. Il faut une entité capable de construire sans perdre le cadre de décision.",
        en: "The direction is set but the system does not exist yet — or legacy prevents execution. An entity capable of building without losing the decision frame is needed.",
      },
      expectedOutcome: {
        fr: "Un système opérationnel, gouvernable et documenté — plateforme, produit ou composant — livré via Omnivya Expert avec traçabilité des choix.",
        en: "An operational, governable and documented system — platform, product or component — delivered via Omnivya Expert with traceability of choices.",
      },
      engagementShape: {
        fr: "Delivery structurée via Omnivya Expert : fondations, automatisation, sécurité et opérabilité intégrées dès le départ. Périmètre défini à partir d’une décision ou d’un diagnostic préalable.",
        en: "Structured delivery via Omnivya Expert: foundations, automation, security and operability integrated from the start. Scope defined from a prior decision or diagnosis.",
      },
      included: {
        fr: [
          "Exécution technique via Omnivya Expert",
          "Plateforme, GitOps, observabilité selon périmètre",
          "Sécurité supply chain intégrée au delivery",
          "Documentation et montée en compétence",
          "Alignement avec les principes publiés et les décisions documentées",
        ],
        en: [
          "Technical execution via Omnivya Expert",
          "Platform, GitOps, observability per scope",
          "Supply chain security integrated into delivery",
          "Documentation and skills transfer",
          "Alignment with published principles and documented decisions",
        ],
      },
      excluded: {
        fr: [
          "Engagement sans décision ou diagnostic préalable (sauf cadrage express)",
          "Promesse d’uptime ou SLA non contractuellement définis",
          "Staff augmentation pur sans ownership plateforme",
          "Métriques de succès inventées",
        ],
        en: [
          "Engagement without prior decision or diagnosis (except express scoping)",
          "Uptime promises or SLAs not contractually defined",
          "Pure staff augmentation without platform ownership",
          "Invented success metrics",
        ],
      },
      proofs: [
        { kind: "project", id: "external-metrics-exporter" },
        { kind: "article", id: "2026-07-13-de-la-metrique-au-runbook" },
        { kind: "article", id: "2024-09-16-managed-identities" },
      ],
      cta: {
        label: { fr: "Parler delivery Omnivya Expert", en: "Discuss Omnivya Expert delivery" },
        subject: {
          fr: "Demande mission build Omnivya Expert",
          en: "Omnivya Expert build mission request",
        },
        secondaryLink: {
          fr: { label: "Voir Omnivya Expert", href: "https://www.omnivya.fr" },
          en: { label: "View Omnivya Expert", href: "https://www.omnivya.fr" },
        },
      },
    },
  ] satisfies InterventionModeDefinition[],
  speaking: {
    title: { fr: "Speaking and advisory", en: "Speaking and advisory" },
    summary: {
      fr: "Interventions ponctuelles : conférences, panels, formations ciblées ou conseil court (architecture, plateforme, DevSecOps).",
      en: "One-off interventions: conferences, panels, targeted training or short advisory (architecture, platform, DevSecOps).",
    },
    included: {
      fr: [
        "Keynotes et ateliers sur des sujets documentés",
        "Conseil ponctuel ou accompagnement CTO sur un sujet précis",
        "Pas de catalogue commercial ni formulaire massif",
      ],
      en: [
        "Keynotes and workshops on documented topics",
        "Short advisory or CTO accompaniment on a specific topic",
        "No commercial catalog or mass intake form",
      ],
    },
    cta: {
      label: { fr: "Solliciter une intervention", en: "Request an intervention" },
      subject: {
        fr: "Demande intervention speaking",
        en: "Speaking intervention request",
      },
    },
  },
  labels: {
    objective: { fr: "Objectif", en: "Objective" },
    scopeExamples: { fr: "Exemples de périmètre", en: "Scope examples" },
    possibleDeliverables: { fr: "Livrables possibles", en: "Possible deliverables" },
    startingSituation: { fr: "Situation de départ", en: "Starting situation" },
    expectedOutcome: { fr: "Résultat attendu", en: "Expected outcome" },
    engagementShape: { fr: "Forme de l’engagement", en: "Engagement shape" },
    included: { fr: "Ce qui est inclus", en: "What is included" },
    excluded: { fr: "Ce qui n’est pas inclus", en: "What is not included" },
    proofs: { fr: "Preuves associées", en: "Associated proofs" },
    emailCta: { fr: "Envoyer un email qualifié", en: "Send a qualified email" },
    calendarCta: { fr: "Prendre rendez-vous", en: "Book a meeting" },
    viewProof: { fr: "Voir la preuve", en: "View proof" },
    readProof: { fr: "Lire", en: "Read" },
    openProof: { fr: "Ouvrir", en: "Open" },
    speakingLink: { fr: "Voir Speaking", en: "View Speaking" },
  },
} as const;
