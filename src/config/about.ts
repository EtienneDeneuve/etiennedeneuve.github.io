export type Localized = { fr: string; en: string };

export type AboutTimelineItem = {
  period: string;
  title: Localized;
  body: Localized;
};

/**
 * /about — person, path, responsibilities.
 * Method and service framing live on /work and /thinking.
 */
export const aboutConfig = {
  meta: {
    title: { fr: "About", en: "About" } as Localized,
    description: {
      fr: "Parcours et responsabilités d’Etienne Deneuve, CTO conseil et CTO d’Omnivya.",
      en: "Background and responsibilities of Etienne Deneuve, advisory CTO and CTO of Omnivya.",
    } as Localized,
    lead: {
      fr: "Du terrain opérationnel à la direction technique : élargir le périmètre des décisions, pas collectionner les titres.",
      en: "From operational fieldwork to technical leadership: widening the scope of decisions, not stacking titles.",
    } as Localized,
  },
  today: {
    title: { fr: "Aujourd’hui", en: "Today" } as Localized,
    paragraphs: {
      fr: [
        "Je suis CTO conseil et CTO d’Omnivya. J’aide directions et équipes à comprendre les causes, éclairer les arbitrages et tenir une trajectoire — sans confisquer le contrôle.",
        "Avec Taous, nous cofondons Omnivya : elle dirige Omnivya et Omnivya Expert ; je suis CTO. Les missions qui nécessitent une capacité de delivery structurée sont portées par Omnivya Expert.",
      ],
      en: [
        "I am an advisory CTO and CTO of Omnivya. I help leadership and teams understand causes, clarify trade-offs and hold a trajectory — without seizing control.",
        "With Taous, we co-found Omnivya: she leads Omnivya and Omnivya Expert; I am CTO. Missions that need structured delivery capacity are carried by Omnivya Expert.",
      ],
    },
  },
  path: {
    title: { fr: "Parcours", en: "Path" } as Localized,
    paragraphs: {
      fr: [
        "La carrière a commencé en 2006 par l’opérationnel et le support, dont le terrain ADSL. Puis infrastructure, cloud, plateforme, DevSecOps et architecture : du composant au système, de l’incident à la décision irréversible.",
        "Vingt ans de terrain ont déplacé le centre de gravité : moins d’outils à collectionner, plus de décisions à sécuriser. La technique reste nécessaire ; elle ne suffit plus comme seule réponse.",
      ],
      en: [
        "The career started in 2006 in operations and support, including ADSL fieldwork. Then infrastructure, cloud, platform, DevSecOps and architecture: from component to system, from incident to irreversible decision.",
        "Twenty years in the field shifted the center of gravity: fewer tools to collect, more decisions to secure. Technique remains necessary; it is no longer enough as the only answer.",
      ],
    },
  },
  responsibilities: {
    title: { fr: "Responsabilités", en: "Responsibilities" } as Localized,
    paragraphs: {
      fr: [
        "Chez Omnivya : architecture, plateforme, sécurité et produits techniques. Omnivya Expert porte le conseil et la delivery structurés. Ce site publie le raisonnement et les preuves ; ce n’est pas le canal commercial.",
      ],
      en: [
        "At Omnivya: architecture, platform, security and technical products. Omnivya Expert carries structured consulting and delivery. This site publishes reasoning and proof; it is not the commercial channel.",
      ],
    },
  },
  timeline: {
    title: { fr: "Chronologie", en: "Timeline" } as Localized,
    intro: {
      fr: "Repères, pas un CV exhaustif.",
      en: "Markers, not an exhaustive CV.",
    } as Localized,
    items: [
      {
        period: "2006",
        title: {
          fr: "Début de carrière terrain",
          en: "Start of field career",
        },
        body: {
          fr: "Opérationnel et support, dont le terrain ADSL, au contact des pannes et des utilisateurs.",
          en: "Operations and support, including ADSL fieldwork, in contact with failures and users.",
        },
      },
      {
        period: "2006–2016",
        title: {
          fr: "Infrastructure et systèmes",
          en: "Infrastructure and systems",
        },
        body: {
          fr: "Administration, infrastructure et préparation des environnements, du composant au périmètre système.",
          en: "Administration, infrastructure and environment preparation, from component to system scope.",
        },
      },
      {
        period: "2016–2020",
        title: {
          fr: "Cloud, plateforme, architecture",
          en: "Cloud, platform, architecture",
        },
        body: {
          fr: "Architecture cloud, infrastructure as code, DevSecOps et plateforme : décisions plus larges, conséquences plus durables.",
          en: "Cloud architecture, infrastructure as code, DevSecOps and platform: broader decisions, longer-lived consequences.",
        },
      },
      {
        period: "2020",
        title: {
          fr: "Conseil et ingénierie",
          en: "Consulting and engineering",
        },
        body: {
          fr: "Activité entrepreneuriale de conseil et d’ingénierie. Rôle de CTO sur l’architecture, les plateformes et la delivery technique.",
          en: "Entrepreneurial consulting and engineering. CTO role on architecture, platforms and technical delivery.",
        },
      },
      {
        period: "2025",
        title: {
          fr: "Omnivya et Omnivya Expert",
          en: "Omnivya and Omnivya Expert",
        },
        body: {
          fr: "Omnivya structure le cadre. Omnivya Expert porte les missions de conseil et de delivery structurées.",
          en: "Omnivya structures the frame. Omnivya Expert carries structured consulting and delivery missions.",
        },
      },
    ] satisfies AboutTimelineItem[],
  },
  links: {
    title: { fr: "Ailleurs sur le site", en: "Elsewhere on the site" } as Localized,
    work: { fr: "Accompagnement — quand me solliciter", en: "Advisory — when to engage me" } as Localized,
    projects: { fr: "Projets", en: "Projects" } as Localized,
    speaking: { fr: "Conférences & médias", en: "Talks & media" } as Localized,
    thinking: { fr: "Thinking", en: "Thinking" } as Localized,
    contact: { fr: "Contact", en: "Contact" } as Localized,
  },
  labels: {
    work: { fr: "Accompagnement", en: "Advisory" } as Localized,
    omnivyaLink: { fr: "Omnivya", en: "Omnivya" } as Localized,
  },
} as const;
