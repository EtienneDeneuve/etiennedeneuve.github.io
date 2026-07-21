export type SpeakingFormat =
  | "keynote"
  | "conference"
  | "panel"
  | "workshop"
  | "executive-briefing"
  | "podcast";

export type LocalizedText = { fr: string; en: string };

export type SpeakingTopicLink = {
  label: LocalizedText;
  href: string;
};

export type SpeakingTopic = {
  id: string;
  title: LocalizedText;
  problem: LocalizedText;
  audience: LocalizedText;
  learnings: { fr: [string, string, string]; en: [string, string, string] };
  formats: SpeakingFormat[];
  languages: Array<"fr" | "en">;
  links: SpeakingTopicLink[];
  displayOrder: number;
};

export const speakingFormats: Array<{
  id: SpeakingFormat;
  label: LocalizedText;
  description: LocalizedText;
}> = [
  {
    id: "keynote",
    label: { fr: "Keynote", en: "Keynote" },
    description: {
      fr: "Vision et décisions structurantes pour ouvrir ou clôturer un événement.",
      en: "Vision and structuring decisions to open or close an event.",
    },
  },
  {
    id: "conference",
    label: { fr: "Conférence", en: "Conference talk" },
    description: {
      fr: "Session approfondie avec cadre, exemples et implications opérationnelles.",
      en: "In-depth session with framing, examples, and operational implications.",
    },
  },
  {
    id: "panel",
    label: { fr: "Panel", en: "Panel" },
    description: {
      fr: "Échange avec d'autres praticiens sur un sujet de gouvernance ou d'architecture.",
      en: "Discussion with other practitioners on governance or architecture.",
    },
  },
  {
    id: "workshop",
    label: { fr: "Workshop", en: "Workshop" },
    description: {
      fr: "Travail guidé sur un cas réel : cartographie, arbitrages ou critères de décision.",
      en: "Guided work on a real case: mapping, trade-offs, or decision criteria.",
    },
  },
  {
    id: "executive-briefing",
    label: { fr: "Briefing exécutif", en: "Executive briefing" },
    description: {
      fr: "Synthèse pour décideurs : risque, options et conséquences irréversibles.",
      en: "Executive synthesis: risk, options, and irreversible consequences.",
    },
  },
  {
    id: "podcast",
    label: { fr: "Podcast", en: "Podcast" },
    description: {
      fr: "Conversation longue format sur un angle précis, sans slide deck obligatoire.",
      en: "Long-form conversation on a specific angle, without a mandatory slide deck.",
    },
  },
];

export const speakingPageConfig = {
  meta: {
    title: { fr: "Speaking", en: "Speaking" },
    description: {
      fr: "Interventions sur la compréhension, la gouvernance et la transformation des systèmes numériques complexes.",
      en: "Talks on understanding, governing, and transforming complex digital systems.",
    },
    positioning: {
      fr: "Etienne intervient sur la manière de comprendre, gouverner et transformer les systèmes numériques complexes — pas sur une liste générique de buzzwords.",
      en: "Etienne speaks about how to understand, govern, and transform complex digital systems — not a generic buzzword checklist.",
    },
    topicsIntro: {
      fr: "Sujets documentés sur ce site. Chaque intervention peut être adaptée au contexte, à l'audience et au format — sans durée imposée par défaut.",
      en: "Topics documented on this site. Each talk can be adapted to context, audience, and format — with no default fixed duration.",
    },
    appearancesTitle: { fr: "Apparitions documentées", en: "Documented appearances" },
    mediaKitTitle: { fr: "Media kit", en: "Media kit" },
    mediaKitIntro: {
      fr: "Ressources pour organisateurs et médias — mêmes données que le PDF téléchargeable.",
      en: "Resources for organizers and media — same data as the downloadable PDF.",
    },
    ctaTitle: {
      fr: "Proposer une intervention",
      en: "Propose a talk",
    },
    ctaBody: {
      fr: "Décrivez l'événement, l'audience et le sujet visé. Je réponds avec un format adapté ou une alternative documentée.",
      en: "Describe the event, audience, and target topic. I respond with a suitable format or a documented alternative.",
    },
  },
  cta: {
    emailSubject: {
      fr: "Demande intervention speaking",
      en: "Speaking intervention request",
    },
  },
} as const;

export const speakingTopics: SpeakingTopic[] = [
  {
    id: "living-system-map",
    title: {
      fr: "Construire une carte vivante du système d'information",
      en: "Building a living map of the information system",
    },
    problem: {
      fr: "Les organisations décident sur des schémas figés ou des inventaires incomplets ; personne ne partage la même représentation du système.",
      en: "Organizations decide on frozen diagrams or incomplete inventories; no one shares the same representation of the system.",
    },
    audience: {
      fr: "CTO, architectes, responsables plateforme et sécurité",
      en: "CTOs, architects, platform and security leads",
    },
    learnings: {
      fr: [
        "Une carte utile sert une décision — pas un dashboard de plus.",
        "Code, cloud, runtime et supply chain doivent être lus ensemble.",
        "La cartographie est un processus continu, pas un livrable ponctuel.",
      ],
      en: [
        "A useful map serves a decision — not another dashboard.",
        "Code, cloud, runtime, and supply chain must be read together.",
        "Mapping is a continuous process, not a one-off deliverable.",
      ],
    },
    formats: ["keynote", "conference", "workshop", "executive-briefing"],
    languages: ["fr", "en"],
    links: [
      {
        label: { fr: "Start Here — cartographie", en: "Start Here — mapping" },
        href: "/start-here/",
      },
      {
        label: { fr: "Thinking: identités managées", en: "Thinking: managed identities" },
        href: "/thinking/2024-09-16-managed-identities/",
      },
    ],
    displayOrder: 1,
  },
  {
    id: "sbom-as-decision",
    title: {
      fr: "Le SBOM comme outil de décision, pas comme fichier de conformité",
      en: "SBOM as a decision tool, not a compliance checkbox",
    },
    problem: {
      fr: "Le SBOM est produit pour l'audit mais rarement utilisé pour prioriser le risque ou arbitrer les mises à jour.",
      en: "SBOMs are produced for audits but rarely used to prioritize risk or arbitrate updates.",
    },
    audience: {
      fr: "CISO, responsables supply chain, leads plateforme et SRE",
      en: "CISOs, supply chain leads, platform and SRE leads",
    },
    learnings: {
      fr: [
        "Relier le SBOM aux décisions de patch et de déploiement.",
        "Distinguer risque réel, surface d'exposition et obligation réglementaire.",
        "Intégrer le SBOM au cycle de delivery — pas en fin de chaîne.",
      ],
      en: [
        "Connect the SBOM to patch and deployment decisions.",
        "Distinguish real risk, exposure surface, and regulatory obligation.",
        "Integrate SBOM into the delivery cycle — not at the end of the chain.",
      ],
    },
    formats: ["conference", "panel", "workshop", "executive-briefing"],
    languages: ["fr", "en"],
    links: [
      {
        label: { fr: "Thinking — supply chain", en: "Thinking — supply chain" },
        href: "/thinking/",
      },
    ],
    displayOrder: 2,
  },
  {
    id: "alert-fatigue",
    title: {
      fr: "Pourquoi cinquante mille alertes ne rendent pas un système plus sûr",
      en: "Why fifty thousand alerts do not make a system safer",
    },
    problem: {
      fr: "L'observabilité est confondue avec le volume de signaux ; les équipes noient sous les alertes sans réduire le risque.",
      en: "Observability is confused with signal volume; teams drown in alerts without reducing risk.",
    },
    audience: {
      fr: "SRE, responsables observabilité, engineering managers",
      en: "SREs, observability leads, engineering managers",
    },
    learnings: {
      fr: [
        "Mesurer la capacité à agir, pas le nombre de règles déclenchées.",
        "Relier signaux, runbooks et décisions de capacité.",
        "OpenTelemetry comme langage commun — pas comme catalogue d'outils.",
      ],
      en: [
        "Measure ability to act, not the number of triggered rules.",
        "Connect signals, runbooks, and capacity decisions.",
        "OpenTelemetry as a common language — not a tool catalog.",
      ],
    },
    formats: ["keynote", "conference", "panel", "workshop"],
    languages: ["fr", "en"],
    links: [
      {
        label: { fr: "Thinking — observabilité", en: "Thinking — observability" },
        href: "/thinking/",
      },
    ],
    displayOrder: 3,
  },
  {
    id: "platform-cognitive-load",
    title: {
      fr: "Platform engineering : réduire la charge cognitive sans créer une nouvelle bureaucratie",
      en: "Platform engineering: reducing cognitive load without new bureaucracy",
    },
    problem: {
      fr: "Les Internal Developer Platforms deviennent un guichet unique rigide au lieu de simplifier le chemin vers la production.",
      en: "Internal Developer Platforms become rigid single windows instead of simplifying the path to production.",
    },
    audience: {
      fr: "Platform engineers, CTO, leads produit et infrastructure",
      en: "Platform engineers, CTOs, product and infrastructure leads",
    },
    learnings: {
      fr: [
        "Définir le produit plateforme par les frictions supprimées, pas par la stack.",
        "Golden paths oui — imposition aveugle non.",
        "Mesurer l'adoption par les décisions accélérées, pas par le nombre de services catalogués.",
      ],
      en: [
        "Define the platform product by removed frictions, not by the stack.",
        "Golden paths yes — blind enforcement no.",
        "Measure adoption by accelerated decisions, not catalogued service count.",
      ],
    },
    formats: ["keynote", "conference", "panel", "workshop", "executive-briefing"],
    languages: ["fr", "en"],
    links: [
      {
        label: { fr: "Work — modes d'intervention", en: "Work — intervention modes" },
        href: "/work/",
      },
      {
        label: { fr: "Projet Omnivya", en: "Omnivya project" },
        href: "/projects/omnivya/",
      },
    ],
    displayOrder: 4,
  },
  {
    id: "constrained-markets",
    title: {
      fr: "Concevoir des produits numériques pour des marchés contraints",
      en: "Designing digital products for constrained markets",
    },
    problem: {
      fr: "Les produits pensés pour un marché global échouent face aux contraintes réglementaires, culturelles et d'infrastructure locales.",
      en: "Products designed for a global market fail against local regulatory, cultural, and infrastructure constraints.",
    },
    audience: {
      fr: "Fondateurs, product leads, investisseurs et partenaires institutionnels",
      en: "Founders, product leads, investors, and institutional partners",
    },
    learnings: {
      fr: [
        "La contrainte n'est pas un retard — c'est un filtre de design.",
        "Architecture, conformité et go-to-market doivent être co-conçus.",
        "Les preuves de traction passent par des produits accessibles, pas des slides.",
      ],
      en: [
        "Constraint is not lag — it is a design filter.",
        "Architecture, compliance, and go-to-market must be co-designed.",
        "Traction proof comes from accessible products, not slides.",
      ],
    },
    formats: ["conference", "panel", "workshop", "executive-briefing", "podcast"],
    languages: ["fr", "en"],
    links: [
      {
        label: { fr: "Sanad (IT Challenge)", en: "Sanad (IT Challenge)" },
        href: "/projects/sanad/",
      },
      {
        label: { fr: "My Dare", en: "My Dare" },
        href: "/projects/my-dare/",
      },
    ],
    displayOrder: 5,
  },
  {
    id: "external-dependencies",
    title: {
      fr: "Dépendances externes : ce que Kubernetes ne vous montre pas",
      en: "External dependencies: what Kubernetes does not show you",
    },
    problem: {
      fr: "Les workloads dépendent de services hors cluster ; le plan de contrôle ne cartographie ni leur santé ni leur impact sur le SLO.",
      en: "Workloads depend on off-cluster services; the control plane neither maps their health nor their SLO impact.",
    },
    audience: {
      fr: "SRE, platform engineers, architectes cloud-native",
      en: "SREs, platform engineers, cloud-native architects",
    },
    learnings: {
      fr: [
        "Exporter des signaux comparables pour les dépendances externes.",
        "Relier découverte automatique et runbooks actionnables.",
        "Ne pas confondre disponibilité pod et disponibilité service métier.",
      ],
      en: [
        "Export comparable signals for external dependencies.",
        "Connect automatic discovery and actionable runbooks.",
        "Do not confuse pod availability and business service availability.",
      ],
    },
    formats: ["conference", "workshop", "panel"],
    languages: ["fr", "en"],
    links: [
      {
        label: { fr: "External Metrics Exporter", en: "External Metrics Exporter" },
        href: "/projects/external-metrics-exporter/",
      },
      {
        label: { fr: "Open source", en: "Open source" },
        href: "/projects/#open-source",
      },
    ],
    displayOrder: 6,
  },
  {
    id: "irreversible-decisions",
    title: {
      fr: "Architecture, risque et décisions irréversibles",
      en: "Architecture, risk, and irreversible decisions",
    },
    problem: {
      fr: "Les choix d'architecture sont traités comme réversibles alors qu'ils engagent coût, sécurité et trajectoire produit sur des années.",
      en: "Architecture choices are treated as reversible when they commit cost, security, and product trajectory for years.",
    },
    audience: {
      fr: "CTO, CISO, architectes d'entreprise et comités de direction technique",
      en: "CTOs, CISOs, enterprise architects, and technical steering committees",
    },
    learnings: {
      fr: [
        "Classer les décisions par coût de retour arrière, pas par hype cycle.",
        "Documenter le contexte et les alternatives écartées.",
        "Relier architecture decisions records et gouvernance opérationnelle.",
      ],
      en: [
        "Classify decisions by rollback cost, not hype cycle.",
        "Document context and rejected alternatives.",
        "Connect architecture decision records and operational governance.",
      ],
    },
    formats: ["keynote", "conference", "executive-briefing", "panel"],
    languages: ["fr", "en"],
    links: [
      {
        label: { fr: "Thinking — doctrine", en: "Thinking — doctrine" },
        href: "/thinking/",
      },
      {
        label: { fr: "Work — Diagnose", en: "Work — Diagnose" },
        href: "/work/#diagnose",
      },
    ],
    displayOrder: 7,
  },
];

export const mediaKitConfig = {
  photo: {
    src: "/assets/portrait-640.jpg",
    fullSrc: "/assets/portrait.jpg",
    alt: { fr: "Etienne Deneuve — portrait", en: "Etienne Deneuve — headshot" },
    downloadFilename: "etienne-deneuve-portrait.jpg",
    width: 640,
    height: 854,
  },
  shortBio: {
    fr: "Etienne Deneuve est Platform Reliability Architect et CTO d'Omnivya, basé près de Paris. Via cette structure, il conçoit et sécurise des plateformes cloud et Kubernetes — observabilité (OpenTelemetry), FinOps, DevSecOps et platform engineering — pour des organisations en finance, luxe et santé numérique. Il publie sur etienne.deneuve.xyz.",
    en: "Etienne Deneuve is a Platform Reliability Architect and CTO at Omnivya, based near Paris. Through Omnivya, he designs and secures cloud and Kubernetes platforms — OpenTelemetry, FinOps, DevSecOps, and platform engineering — for organisations in finance, luxury, and public digital health. He writes at etienne.deneuve.xyz.",
  },
  longBio: {
    fr: [
      "Depuis plus de quinze ans, Etienne Deneuve construit et modernise des infrastructures — d'abord en exploitation et avant-vente, puis en mission via des ESN et éditeurs (Cellenza, Dell Technologies), et depuis 2020 comme CTO d'Omnivya.",
      "Ancien Microsoft MVP — Cloud and Datacenter Management (cycles 2017-2018, 2018-2019, 2019-2020). Son périmètre couvre Kubernetes (AKS), l'infrastructure as code (Terraform, Flux), la sécurité intégrée au delivery et la gouvernabilité des plateformes.",
      "Il a présenté à Microsoft Experience 2017 et au French PowerShell User Group ; il a contribué à l'open source OS Factory dans une mission via Cellenza. Il intervient sur la compréhension, la gouvernance et la transformation des systèmes numériques complexes.",
    ],
    en: [
      "For over fifteen years, Etienne Deneuve has built and modernised infrastructure — first in operations and pre-sales, then on assignments via systems integrators and vendors (Cellenza, Dell Technologies), and since 2020 as CTO of Omnivya.",
      "Former Microsoft MVP — Cloud and Datacenter Management (2017-2018, 2018-2019, 2019-2020 cycles). His scope covers Kubernetes (AKS), infrastructure as code (Terraform, Flux), security integrated into delivery, and platform governability.",
      "He spoke at Microsoft Experience 2017 and the French PowerShell User Group; he contributed to the OS Factory open source project during a Cellenza assignment. He speaks about understanding, governing, and transforming complex digital systems.",
    ],
  },
  languages: {
    fr: "Français et anglais",
    en: "French and English",
  },
  themesIntro: {
    fr: "Thèmes documentés sur etienne.deneuve.xyz/speaking — adaptables au format et à l'audience.",
    en: "Topics documented at etienne.deneuve.xyz/en/speaking — adaptable to format and audience.",
  },
} as const;

export function getSortedSpeakingTopics(): SpeakingTopic[] {
  return [...speakingTopics].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getFormatLabel(format: SpeakingFormat, lang: "fr" | "en"): string {
  return speakingFormats.find((item) => item.id === format)?.label[lang] ?? format;
}
