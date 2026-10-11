/**
 * /work — Accompagnement (advisory CTO).
 * Situations first; not a Diagnose/Decide/Build service catalog.
 */

type Localized<T> = { fr: T; en: T };

export type WorkSituation = {
  id: string;
  title: Localized<string>;
  body: Localized<string>;
};

export const workConfig = {
  meta: {
    title: { fr: "Accompagnement", en: "Advisory" } as Localized<string>,
    description: {
      fr: "Quand faire appel à un CTO conseil : clarifier les causes, éclairer les arbitrages et accompagner la trajectoire — missions via Omnivya.",
      en: "When to bring in an advisory CTO: clarify causes, illuminate trade-offs and support the trajectory — missions through Omnivya.",
    } as Localized<string>,
    eyebrow: {
      fr: "CTO conseil",
      en: "Advisory CTO",
    } as Localized<string>,
    intro: {
      fr: "Vous n’avez pas besoin d’un catalogue de prestations. Vous avez besoin de savoir si je peux vous aider sur votre situation — et sous quelle forme.",
      en: "You do not need a service catalog. You need to know whether I can help with your situation — and in what form.",
    } as Localized<string>,
  },
  situations: [
    {
      id: "decision-blocked",
      title: {
        fr: "Une décision est bloquée",
        en: "A decision is stuck",
      },
      body: {
        fr: "Options floues, responsabilités floues, ou peur de trancher. Je rends les options, les conséquences et les responsabilités explicites pour que la direction puisse choisir.",
        en: "Blurry options, blurry accountabilities, or fear of deciding. I make options, consequences and accountabilities explicit so leadership can choose.",
      },
    },
    {
      id: "org-system-mix",
      title: {
        fr: "Organisation, équipes et systèmes sont mélangés",
        en: "Organisation, teams and systems are entangled",
      },
      body: {
        fr: "On parle d’outil alors que le levier est humain ou organisationnel — ou l’inverse. Je distingue les causes avant de proposer un levier.",
        en: "People talk tools when the lever is human or organisational — or the reverse. I separate causes before proposing a lever.",
      },
    },
    {
      id: "trajectory",
      title: {
        fr: "Une trajectoire doit être tenue",
        en: "A trajectory must be held",
      },
      body: {
        fr: "Après le diagnostic ou la décision, les équipes ont besoin d’un regard extérieur qui challenge sans confisquer le contrôle. J’accompagne, je ne remplace pas le management.",
        en: "After diagnosis or decision, teams need an outside view that challenges without seizing control. I support; I do not replace management.",
      },
    },
    {
      id: "execution-needed",
      title: {
        fr: "Il faut exécuter un périmètre borné",
        en: "A bounded scope must be executed",
      },
      body: {
        fr: "Quand le diagnostic est clair et que la delivery technique est nécessaire, la mission passe par Omnivya Expert — cadre, durée et livrables explicites.",
        en: "When the diagnosis is clear and technical delivery is required, the mission goes through Omnivya Expert — explicit frame, duration and deliverables.",
      },
    },
  ] satisfies WorkSituation[],
  method: {
    title: { fr: "Comment j’interviens", en: "How I work" } as Localized<string>,
    steps: [
      {
        number: "01",
        title: { fr: "Comprendre la situation", en: "Understand the situation" },
        body: {
          fr: "Écouter les équipes et distinguer causes humaines, organisationnelles et techniques.",
          en: "Listen to teams and separate human, organisational and technical causes.",
        },
      },
      {
        number: "02",
        title: { fr: "Éclairer les choix", en: "Clarify the choices" },
        body: {
          fr: "Rendre options, responsabilités et conséquences explicites.",
          en: "Make options, accountabilities and consequences explicit.",
        },
      },
      {
        number: "03",
        title: { fr: "Accompagner la trajectoire", en: "Support the trajectory" },
        body: {
          fr: "Guider, challenger et ajuster — sans staffing ni promesse magique.",
          en: "Guide, challenge and adjust — no staff-aug, no magic promise.",
        },
      },
    ],
  },
  boundaries: {
    title: { fr: "Ce que je ne fais pas", en: "What I do not do" } as Localized<string>,
    items: {
      fr: [
        "Staff augmentation sans cadre de décision",
        "Promesses d’uptime ou de gains chiffrés non sourcés",
        "Remplacer le management ou porter l’exécution hors Omnivya Expert",
      ],
      en: [
        "Staff augmentation without a decision frame",
        "Unsourced uptime or savings promises",
        "Replace management or carry execution outside Omnivya Expert",
      ],
    } as Localized<string[]>,
  },
  cta: {
    title: { fr: "Échanger", en: "Talk" } as Localized<string>,
    body: {
      fr: "Décrivez la situation en quelques lignes. Si une mission structurée est pertinente, on la cadre via Omnivya.",
      en: "Describe the situation in a few lines. If a structured mission fits, we frame it through Omnivya.",
    } as Localized<string>,
    contactLabel: { fr: "Contacter", en: "Contact" } as Localized<string>,
    omnivyaLabel: { fr: "Mission via Omnivya", en: "Mission via Omnivya" } as Localized<string>,
  },
  labels: {
    speakingLink: { fr: "Conférences & médias", en: "Talks & media" } as Localized<string>,
    situationsTitle: { fr: "Quand me solliciter", en: "When to engage me" } as Localized<string>,
  },
} as const;
