export type Localized = { fr: string; en: string };

export type AboutTimelineItem = {
  period: string;
  title: Localized;
  body: Localized;
};

export const aboutConfig = {
  meta: {
    title: { fr: "About", en: "About" } as Localized,
    description: {
      fr: "Parcours, expertise et manière de travailler d’Etienne Deneuve : architecture, cloud, Kubernetes, plateformes, observabilité et gouvernance technique.",
      en: "Background, expertise and working approach of Etienne Deneuve: architecture, cloud, Kubernetes, platforms, observability and technical governance.",
    } as Localized,
    lead: {
      fr: "Cinq constantes depuis le terrain : comprendre les systèmes, réduire la complexité, sécuriser les décisions, construire ce qui manque, confronter les idées à la réalité.",
      en: "Five constants from the field: understand systems, reduce complexity, secure decisions, build what is missing, confront ideas with reality.",
    } as Localized,
  },
  unity: {
    title: { fr: "Ce qui ne change pas", en: "What stays constant" } as Localized,
    items: [
      {
        fr: "Comprendre les systèmes",
        en: "Understand systems",
      },
      {
        fr: "Réduire la complexité",
        en: "Reduce complexity",
      },
      {
        fr: "Sécuriser les décisions",
        en: "Secure decisions",
      },
      {
        fr: "Construire ce qui manque",
        en: "Build what is missing",
      },
      {
        fr: "Confronter les idées au terrain",
        en: "Confront ideas with the field",
      },
    ] as Localized[],
  },
  today: {
    title: { fr: "Ce que je fais aujourd’hui", en: "What I do today" } as Localized,
    paragraphs: {
      fr: [
        "Je conçois, sécurise et rends gouvernables des systèmes numériques complexes : plateformes cloud, Kubernetes, DevSecOps, observabilité et architecture de décision.",
        "Je suis Platform Reliability Architect et CTO. Je suis cofondateur et CTO d’Omnivya, où je travaille sur des sujets d’architecture, de plateforme, de sécurité et de produits techniques. Les missions nécessitant une capacité de delivery structurée sont portées par Omnivya Expert. Ce site publie mes principes, les preuves et le raisonnement ; ce n’est pas un catalogue commercial.",
      ],
      en: [
        "I design, secure and make complex digital systems governable: cloud platforms, Kubernetes, DevSecOps, observability and decision architecture.",
        "I am a Platform Reliability Architect and CTO. I am co-founder and CTO of Omnivya, where I work on architecture, platform, security and technical product topics. Missions that need structured delivery capacity are carried by Omnivya Expert. This site publishes my principles, proof and reasoning; it is not a commercial catalog.",
      ],
    },
  },
  path: {
    title: { fr: "Comment j’en suis arrivé là", en: "How I got here" } as Localized,
    paragraphs: {
      fr: [
        "La carrière a commencé en 2006. Le parcours va du terrain opérationnel, dont le support ADSL, à l’architecture et à la direction technique. Les titres se sont empilés ; surtout, le périmètre s’est élargi : du composant au système, de l’incident à la décision irréversible.",
        "Cloud, infrastructure, plateforme, DevSecOps et architecture se sont empilés sur la même question : comment un système reste-t-il lisible, opérable et gouvernable quand la complexité augmente ?",
      ],
      en: [
        "The career started in 2006. The path runs from operational fieldwork, including ADSL support, to architecture and technical leadership. Titles stacked; more importantly, scope widened: from component to system, from incident to irreversible decision.",
        "Cloud, infrastructure, platform, DevSecOps and architecture stacked on the same question: how does a system stay readable, operable and governable as complexity grows?",
      ],
    },
  },
  twentyYears: {
    title: {
      fr: "Ce que vingt ans de terrain ont changé",
      en: "What twenty years in the field changed",
    } as Localized,
    paragraphs: {
      fr: [
        "Vingt ans de terrain ont déplacé le centre de gravité : moins d’outils à collectionner, plus de décisions à sécuriser. La technique reste nécessaire ; elle ne suffit plus comme seule réponse.",
        "Les systèmes que j’accompagne ne manquent rarement d’outils. Ils manquent de carte partagée, de critères de décision et de la possibilité d’agir sans augmenter la dette invisible.",
        "Concevoir, aujourd’hui, signifie d’abord rendre le système compréhensible, puis seulement automatiser ou industrialiser davantage.",
      ],
      en: [
        "Twenty years in the field shifted the center of gravity: fewer tools to collect, more decisions to secure. Technique remains necessary; it is no longer enough as the only answer.",
        "The systems I work with rarely lack tools. They lack a shared map, decision criteria and the ability to act without growing invisible debt.",
        "Designing, today, means first making the system understandable, and only then automating or industrializing further.",
      ],
    },
  },
  omnivya: {
    title: {
      fr: "Omnivya",
      en: "Omnivya",
    } as Localized,
    paragraphs: {
      fr: [
        "Je suis cofondateur et CTO d’Omnivya, où je travaille sur des sujets d’architecture, de plateforme, de sécurité et de produits techniques.",
        "Omnivya Expert porte les missions de conseil et de delivery structurées. Ce site publie le raisonnement ; Omnivya Expert porte l’exécution. Les deux restent séparés à dessein.",
      ],
      en: [
        "I am co-founder and CTO of Omnivya, where I work on architecture, platform, security and technical product topics.",
        "Omnivya Expert carries structured consulting and delivery missions. This site publishes the reasoning; Omnivya Expert carries execution. The two stay deliberately separate.",
      ],
    },
  },
  doctrine: {
    title: { fr: "Ma façon de travailler", en: "How I work" } as Localized,
    principles: {
      fr: [
        "Comprendre avant d’automatiser : cartographier le système et ses contraintes réelles.",
        "Modéliser les dépendances et le risque, pas seulement les composants techniques.",
        "Réduire la charge cognitive : chaque artefact doit aider une décision concrète.",
        "Documenter les choix irréversibles et les alternatives écartées.",
        "Construire pour les contraintes réelles : techniques, réglementaires et organisationnelles.",
      ],
      en: [
        "Understand before automating: map the system and its real constraints.",
        "Model dependencies and risk, not just technical components.",
        "Reduce cognitive load: every artifact must support a concrete decision.",
        "Document irreversible choices and rejected alternatives.",
        "Build for real constraints: technical, regulatory and organizational.",
      ],
    },
  },
  refuse: {
    title: { fr: "Ce que je refuse de faire", en: "What I refuse to do" } as Localized,
    items: {
      fr: [
        "Vendre un catalogue d’outils sans cadre de décision.",
        "Publier des métriques client non vérifiées ou des preuves fictives.",
        "Confondre volume d’alertes et sécurité réelle.",
        "Créer une plateforme interne qui ajoute de la bureaucratie sans réduire la charge cognitive.",
        "Promettre une transformation sans cartographier le système existant.",
      ],
      en: [
        "Sell a tool catalog without a decision frame.",
        "Publish unverified client metrics or fictional proof.",
        "Confuse alert volume with real security.",
        "Create an internal platform that adds bureaucracy without reducing cognitive load.",
        "Promise a transformation without mapping the existing system.",
      ],
    },
  },
  contact: {
    title: { fr: "Contact", en: "Contact" } as Localized,
    paragraphs: {
      fr: [
        "Pour discuter d’un système complexe, d’une intervention ou d’un contexte plateforme : un email qualifié suffit. Décrivez le contexte, les contraintes et la décision à sécuriser.",
      ],
      en: [
        "To discuss a complex system, an intervention or a platform context: a qualified email is enough. Describe the context, constraints and the decision to secure.",
      ],
    },
  },
  timeline: {
    title: { fr: "Chronologie", en: "Timeline" } as Localized,
    intro: {
      fr: "Repères progressifs, lisibles sans style avancé. Ce n’est pas un CV exhaustif.",
      en: "Progressive markers, readable without advanced styling. This is not an exhaustive CV.",
    } as Localized,
    items: [
      {
        period: "2006",
        title: {
          fr: "Début de carrière terrain",
          en: "Start of field career",
        },
        body: {
          fr: "Entrée par l’opérationnel et le support, dont le terrain ADSL, au contact direct des pannes et des utilisateurs.",
          en: "Entry through operations and support, including ADSL fieldwork, in direct contact with failures and users.",
        },
      },
      {
        period: "2006–2016",
        title: {
          fr: "Infrastructure et systèmes",
          en: "Infrastructure and systems",
        },
        body: {
          fr: "Élargissement vers l’administration, l’infrastructure et la préparation des environnements, du composant au périmètre système.",
          en: "Expansion into administration, infrastructure and environment preparation, from component to system scope.",
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
          fr: "Activité de conseil et d’ingénierie",
          en: "Consulting and engineering activity",
        },
        body: {
          fr: "Démarrage de l’activité entrepreneuriale de conseil et d’ingénierie. Rôle de CTO sur l’architecture, les plateformes et la delivery technique.",
          en: "Start of the entrepreneurial consulting and engineering activity. CTO role on architecture, platforms and technical delivery.",
        },
      },
      {
        period: "2025",
        title: {
          fr: "Omnivya et Omnivya Expert",
          en: "Omnivya and Omnivya Expert",
        },
        body: {
          fr: "Omnivya structure le cadre entrepreneurial et professionnel. Omnivya Expert porte les missions de conseil et de delivery structurées.",
          en: "Omnivya structures the entrepreneurial and professional frame. Omnivya Expert carries structured consulting and delivery missions.",
        },
      },
    ] satisfies AboutTimelineItem[],
  },
  labels: {
    contributions: {
      fr: "Contributions, prises de parole et projets",
      en: "Contributions, speaking and projects",
    } as Localized,
    projects: { fr: "Projets", en: "Projects" } as Localized,
    speaking: { fr: "Speaking", en: "Speaking" } as Localized,
    thinking: { fr: "Thinking", en: "Thinking" } as Localized,
    openSource: { fr: "Open source", en: "Open source" } as Localized,
    startHere: { fr: "Start Here", en: "Start Here" } as Localized,
    emailCta: { fr: "Envoyer un email", en: "Send an email" } as Localized,
    omnivyaLink: { fr: "Voir Omnivya Expert", en: "View Omnivya Expert" } as Localized,
  },
} as const;
