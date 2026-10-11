/**
 * /work — Accompagnement (advisory CTO).
 * Observable visitor situations first; Omnivya is secondary.
 */

type Localized<T> = { fr: T; en: T };

export type WorkSituation = {
  id: string;
  title: Localized<string>;
  /** What the visitor observes */
  signal: Localized<string>;
  /** What Etienne examines */
  examines: Localized<string>;
  /** Decision the engagement supports */
  decision: Localized<string>;
  /** Concrete outcome expected */
  outcome: Localized<string>;
  /** Optional existing on-site reference (not invented cases) */
  related?: { label: Localized<string>; href: string };
};

export const workConfig = {
  meta: {
    title: { fr: "Accompagnement", en: "Advisory" } as Localized<string>,
    description: {
      fr: "Accompagnement CTO conseil : quand les livraisons ralentissent, l’exploitation absorbe la capacité ou un arbitrage reste bloqué.",
      en: "Advisory CTO support: when delivery slows, operations absorb capacity, or a trade-off stays stuck.",
    } as Localized<string>,
    eyebrow: {
      fr: "CTO conseil",
      en: "Advisory CTO",
    } as Localized<string>,
    intro: {
      fr: "Si l’une de ces situations vous ressemble, on peut clarifier ce qu’il faut regarder, quelle décision sécuriser et ce que l’accompagnement change concrètement.",
      en: "If one of these situations sounds familiar, we can clarify what to look at, which decision to secure and what advisory support changes in practice.",
    } as Localized<string>,
  },
  situations: [
    {
      id: "delivery-slowdown",
      title: {
        fr: "Les livraisons ralentissent ou n’aboutissent plus",
        en: "Delivery slows or stops landing",
      },
      signal: {
        fr: "Les fonctionnalités prévues ne sortent plus au rythme attendu, malgré des équipes occupées.",
        en: "Planned features no longer ship at the expected pace, even though teams stay busy.",
      },
      examines: {
        fr: "Je regarde priorités, interfaces entre équipes, dépendances techniques et freins d’organisation — pas seulement la stack.",
        en: "I look at priorities, team interfaces, technical dependencies and organisational friction — not only the stack.",
      },
      decision: {
        fr: "Décider où concentrer l’effort pour débloquer le flux, et ce qu’il faut arrêter de faire.",
        en: "Decide where to focus effort to unblock flow, and what to stop doing.",
      },
      outcome: {
        fr: "Une lecture partagée des causes et un ordre de décisions actionnable par la direction et les leads.",
        en: "A shared reading of causes and a decision order leadership and leads can act on.",
      },
      related: {
        label: { fr: "Publications", en: "Publications" },
        href: "/thinking/",
      },
    },
    {
      id: "ops-absorbs-capacity",
      title: {
        fr: "Incidents et exploitation absorbent la capacité",
        en: "Incidents and operations absorb capacity",
      },
      signal: {
        fr: "La plateforme ou la prod monopolise les équipes : peu de place pour avancer, beaucoup de temps à contenir.",
        en: "The platform or production monopolises teams: little room to advance, much time spent containing.",
      },
      examines: {
        fr: "Je distingue charge d’exploitation, dette invisible, signaux utiles et responsabilités floues entre équipes.",
        en: "I separate operational load, invisible debt, useful signals and blurry accountabilities across teams.",
      },
      decision: {
        fr: "Arbitrer ce qui doit être stabilisé, simplifié ou volontairement non traité.",
        en: "Decide what must be stabilised, simplified or deliberately left alone.",
      },
      outcome: {
        fr: "Des critères pour récupérer de la capacité sans ajouter une couche d’outil ou de process.",
        en: "Criteria to reclaim capacity without adding another tool or process layer.",
      },
      related: {
        label: { fr: "External Metrics Exporter", en: "External Metrics Exporter" },
        href: "/projects/external-metrics-exporter/",
      },
    },
    {
      id: "decision-blocked",
      title: {
        fr: "Un arbitrage reste bloqué",
        en: "A trade-off stays stuck",
      },
      signal: {
        fr: "Options, responsabilités ou peurs de trancher empêchent une décision qui engage coût, sécurité ou trajectoire.",
        en: "Options, accountabilities or fear of deciding block a choice that commits cost, security or trajectory.",
      },
      examines: {
        fr: "Je rends explicites options, conséquences et responsabilités — côté équipes, organisation et technique.",
        en: "I make options, consequences and accountabilities explicit — across teams, organisation and technique.",
      },
      decision: {
        fr: "Permettre à la direction de choisir avec une carte claire, pas un catalogue d’avis.",
        en: "Enable leadership to choose with a clear map, not a catalog of opinions.",
      },
      outcome: {
        fr: "Une décision documentée : choix retenu, alternatives écartées, critères de suivi.",
        en: "A documented decision: chosen path, rejected alternatives, follow-up criteria.",
      },
    },
    {
      id: "unreadability",
      title: {
        fr: "Responsabilités et dépendances sont devenues illisibles",
        en: "Accountabilities and dependencies have become unreadable",
      },
      signal: {
        fr: "Personne ne partage la même carte du système ; la complexité augmente plus vite que la capacité à décider.",
        en: "No one shares the same system map; complexity grows faster than the ability to decide.",
      },
      examines: {
        fr: "Je cartographie dépendances, frontières de responsabilité et points où le système n’est plus gouvernable.",
        en: "I map dependencies, responsibility boundaries and points where the system is no longer governable.",
      },
      decision: {
        fr: "Décider ce qu’il faut rendre lisible en premier pour pouvoir agir sans augmenter la dette.",
        en: "Decide what must become readable first so action is possible without growing debt.",
      },
      outcome: {
        fr: "Une représentation partagée et des leviers ordonnés — humains, organisationnels et techniques.",
        en: "A shared representation and ordered levers — human, organisational and technical.",
      },
      related: {
        label: { fr: "Conférences & médias", en: "Talks & media" },
        href: "/speaking/",
      },
    },
  ] satisfies WorkSituation[],
  method: {
    title: { fr: "Ce que l’accompagnement change", en: "What advisory support changes" } as Localized<string>,
    steps: [
      {
        number: "01",
        title: { fr: "Lire la situation telle qu’elle est", en: "Read the situation as it is" },
        body: {
          fr: "Écouter les équipes et séparer causes humaines, organisationnelles et techniques.",
          en: "Listen to teams and separate human, organisational and technical causes.",
        },
      },
      {
        number: "02",
        title: { fr: "Rendre la décision possible", en: "Make the decision possible" },
        body: {
          fr: "Options, responsabilités et conséquences explicites pour trancher.",
          en: "Explicit options, accountabilities and consequences so a choice can be made.",
        },
      },
      {
        number: "03",
        title: { fr: "Tenir la suite sans confisquer le contrôle", en: "Hold the follow-through without seizing control" },
        body: {
          fr: "Challenger et ajuster avec les leads ; le management reste chez vous.",
          en: "Challenge and adjust with leads; management stays with you.",
        },
      },
    ],
  },
  omnivyaNote: {
    fr: "Quand une mission structurée est pertinente après cet échange, elle peut être cadrée via Omnivya.",
    en: "When a structured mission fits after that conversation, it can be framed through Omnivya.",
  } as Localized<string>,
  cta: {
    title: { fr: "Échanger", en: "Talk" } as Localized<string>,
    body: {
      fr: "Décrivez la situation en quelques lignes.",
      en: "Describe the situation in a few lines.",
    } as Localized<string>,
    contactLabel: { fr: "Contacter", en: "Contact" } as Localized<string>,
    omnivyaLabel: { fr: "Omnivya", en: "Omnivya" } as Localized<string>,
  },
  labels: {
    situationsTitle: { fr: "Situations où j’interviens", en: "Situations I work on" } as Localized<string>,
    examines: { fr: "Ce que j’examine", en: "What I examine" } as Localized<string>,
    decision: { fr: "Décision accompagnée", en: "Decision supported" } as Localized<string>,
    outcome: { fr: "Résultat attendu", en: "Expected outcome" } as Localized<string>,
    related: { fr: "Repère", en: "Reference" } as Localized<string>,
  },
} as const;
