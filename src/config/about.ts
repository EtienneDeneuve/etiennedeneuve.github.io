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
      fr: "Trajectoire, doctrine et unité de travail — comprendre les systèmes, réduire la complexité, sécuriser les décisions.",
      en: "Trajectory, doctrine and working unity — understand systems, reduce complexity, secure decisions.",
    } as Localized,
    lead: {
      fr: "Une trajectoire, cinq constantes : comprendre les systèmes, réduire la complexité, sécuriser les décisions, construire ce qui manque, confronter les idées au terrain.",
      en: "One trajectory, five constants: understand systems, reduce complexity, secure decisions, build what is missing, confront ideas with the field.",
    } as Localized,
  },
  unity: {
    title: { fr: "L’unité de la trajectoire", en: "The unity of the trajectory" } as Localized,
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
        "Je conçois, sécurise et rends gouvernables des systèmes numériques complexes — plateformes cloud, Kubernetes, DevSecOps, observabilité et architecture de décision.",
        "Je suis Platform Reliability Architect. Omnivya porte le conseil et la delivery quand l’exécution est requise. Ce site documente ma doctrine, les preuves publiques et le raisonnement — pas un catalogue commercial.",
      ],
      en: [
        "I design, secure and make complex digital systems governable — cloud platforms, Kubernetes, DevSecOps, observability and decision architecture.",
        "I am a Platform Reliability Architect. Omnivya carries consulting and delivery when execution is required. This site documents my doctrine, public proof and reasoning — not a commercial catalog.",
      ],
    },
  },
  withTaous: {
    title: {
      fr: "Taous",
      en: "Taous",
    } as Localized,
    paragraphs: {
      fr: [
        "Taous est cofondatrice d’Omnivya, d’IT Challenge / Omnivya Expert, de My Dare et de Sanad — France et Algérie.",
        "Ce site documente ma doctrine. Les structures d’exécution et le terrain se portent à deux.",
      ],
      en: [
        "Taous is co-founder of Omnivya, IT Challenge / Omnivya Expert, My Dare and Sanad — France and Algeria.",
        "This site documents my doctrine. Execution structures and the field are carried jointly.",
      ],
    },
  },
  path: {
    title: { fr: "Comment j’en suis arrivé là", en: "How I got here" } as Localized,
    paragraphs: {
      fr: [
        "La carrière a commencé en 2006. Le parcours va du terrain opérationnel — dont le support ADSL — à l’architecture et à la direction technique. L’évolution n’est pas une accumulation de titres : c’est un élargissement du périmètre, du composant au système, de l’incident à la décision irréversible.",
        "Cloud, infrastructure, plateforme, DevSecOps et architecture se sont empilés sur la même question : comment un système reste-t-il lisible, opérable et gouvernable quand la complexité augmente ?",
        "Le travail se déroule entre la France et l’Algérie. Cette double ancrage n’est pas une anecdote géographique : elle force à concevoir pour des contraintes réelles — réglementaires, organisationnelles, territoriales — plutôt que pour un marché idéal.",
      ],
      en: [
        "The career started in 2006. The path runs from operational fieldwork — including ADSL support — to architecture and technical leadership. The evolution is not a stack of titles: it is a widening of scope, from component to system, from incident to irreversible decision.",
        "Cloud, infrastructure, platform, DevSecOps and architecture stacked on the same question: how does a system stay readable, operable and governable as complexity grows?",
        "Work spans France and Algeria. That dual anchoring is not a geographic anecdote: it forces design for real constraints — regulatory, organizational, territorial — rather than for an ideal market.",
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
        "Les systèmes que j’accompagne ne manquent rarement d’outils. Ils manquent de carte partagée, de critères de décision et de capacité à agir sans augmenter la dette invisible.",
        "Concevoir, aujourd’hui, signifie d’abord rendre le système compréhensible — puis seulement automatiser, industrialiser ou industrialiser davantage.",
      ],
      en: [
        "Twenty years in the field shifted the center of gravity: fewer tools to collect, more decisions to secure. Technique remains necessary; it is no longer enough as the only answer.",
        "The systems I work with rarely lack tools. They lack a shared map, decision criteria and the ability to act without growing invisible debt.",
        "Designing, today, means first making the system understandable — and only then automating, industrializing or industrializing further.",
      ],
    },
  },
  omnivya: {
    title: {
      fr: "Pourquoi on a construit Omnivya",
      en: "Why we built Omnivya",
    } as Localized,
    paragraphs: {
      fr: [
        "Omnivya existe pour exécuter sans diluer le cadre de décision. Doctrine personnelle (ce site) et delivery structurée (Omnivya) restent séparées à dessein — l’une clarifie le raisonnement ; l’autre le porte en mission.",
        "Sans structure d’exécution, les idées restent des slides. Sans doctrine, l’exécution devient un catalogue d’outils. Omnivya relie les deux pour des contextes à forte complexité technique et organisationnelle.",
      ],
      en: [
        "Omnivya exists to execute without diluting the decision frame. Personal doctrine (this site) and structured delivery (Omnivya) stay deliberately separate — one clarifies reasoning; the other carries it into missions.",
        "Without an execution structure, ideas stay slides. Without doctrine, execution becomes a tool catalog. Omnivya connects both for contexts of high technical and organizational complexity.",
      ],
    },
  },
  products: {
    title: {
      fr: "Algérie — terrain et outils",
      en: "Algeria — field and tools",
    } as Localized,
    paragraphs: {
      fr: [
        "Côté Algérie : My Dare (coworking à Alger), Sanad (outil via IT Challenge / Omnivya Expert), et la filiale qui porte le build sur place.",
        "IT Challenge / Omnivya Expert ancre le build local. My Dare ancre le terrain. Sanad est une preuve d’outil — pas un portefeuille marketing.",
      ],
      en: [
        "On the Algeria side: My Dare (coworking in Algiers), Sanad (tool via IT Challenge / Omnivya Expert), and the subsidiary that carries the build on the ground.",
        "IT Challenge / Omnivya Expert anchors local build. My Dare anchors the field. Sanad is tool-level proof — not a marketing portfolio.",
      ],
    },
  },
  doctrine: {
    title: { fr: "Ma doctrine de travail", en: "My working doctrine" } as Localized,
    principles: {
      fr: [
        "Comprendre avant d’automatiser — cartographier le système et ses contraintes réelles.",
        "Modéliser les dépendances et le risque — pas seulement les composants techniques.",
        "Réduire la charge cognitive — chaque artefact doit aider une décision concrète.",
        "Documenter les choix irréversibles et les alternatives écartées.",
        "Construire pour les contraintes réelles — réglementaires, organisationnelles, territoriales.",
      ],
      en: [
        "Understand before automating — map the system and its real constraints.",
        "Model dependencies and risk — not just technical components.",
        "Reduce cognitive load — every artifact must support a concrete decision.",
        "Document irreversible choices and rejected alternatives.",
        "Build for real constraints — regulatory, organizational, territorial.",
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
    title: { fr: "Repères de trajectoire", en: "Trajectory markers" } as Localized,
    intro: {
      fr: "Repères progressifs — lisibles sans style avancé. Ce n’est pas un CV exhaustif.",
      en: "Progressive markers — readable without advanced styling. This is not an exhaustive CV.",
    } as Localized,
    items: [
      {
        period: "2006",
        title: {
          fr: "Début de carrière terrain",
          en: "Start of field career",
        },
        body: {
          fr: "Entrée par l’opérationnel et le support — dont le terrain ADSL — au contact direct des pannes et des utilisateurs.",
          en: "Entry through operations and support — including ADSL fieldwork — in direct contact with failures and users.",
        },
      },
      {
        period: "2006–2016",
        title: {
          fr: "Infrastructure et systèmes",
          en: "Infrastructure and systems",
        },
        body: {
          fr: "Élargissement vers l’administration, l’infrastructure et la préparation des environnements — du composant au périmètre système.",
          en: "Expansion into administration, infrastructure and environment preparation — from component to system scope.",
        },
      },
      {
        period: "2016–2020",
        title: {
          fr: "Cloud, plateforme, architecture",
          en: "Cloud, platform, architecture",
        },
        body: {
          fr: "Architecture cloud, infrastructure as code, DevSecOps et plateforme — décisions plus larges, conséquences plus durables.",
          en: "Cloud architecture, infrastructure as code, DevSecOps and platform — broader decisions, longer-lived consequences.",
        },
      },
      {
        period: "2020",
        title: {
          fr: "Fondation d’Omnivya",
          en: "Founding of Omnivya",
        },
        body: {
          fr: "Création d’Omnivya avec Taous — structure d’exécution pour porter conseil et delivery sans diluer le cadre de décision.",
          en: "Founding of Omnivya with Taous — execution structure to carry consulting and delivery without diluting the decision frame.",
        },
      },
      {
        period: "2020–",
        title: {
          fr: "Produits et marchés contraints",
          en: "Products and constrained markets",
        },
        body: {
          fr: "Omnivya ; My Dare et Sanad en Algérie (IT Challenge / Omnivya Expert) ; open source.",
          en: "Omnivya; My Dare and Sanad in Algeria (IT Challenge / Omnivya Expert); open source.",
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
    omnivyaLink: { fr: "Voir Omnivya", en: "View Omnivya" } as Localized,
  },
} as const;
