/** Accompagnement — where a hands-on CTO can help, not a staffing catalogue. */
type Localized<T> = { fr: T; en: T };

export type WorkSituation = {
  id: string;
  title: Localized<string>;
  signal: Localized<string>;
  examines: Localized<string>;
  decision: Localized<string>;
  outcome: Localized<string>;
  related?: { label: Localized<string>; href: string };
};

export const workConfig = {
  meta: {
    title: { fr: "Accompagnement", en: "Advisory" } as Localized<string>,
    description: {
      fr: "CTO expert : équipes, delivery, code et plateformes. Comprendre ce qui bloque, choisir une réponse adaptée et l'éprouver sur le terrain.",
      en: "Hands-on CTO: teams, engineering delivery, software and platforms. Understand what is holding things back, choose an approach and test it in practice.",
    } as Localized<string>,
    eyebrow: { fr: "CTO expert · Interventions", en: "Hands-on CTO · Engagements" },
    headline: {
      fr: "Faire avancer ce qui bloque.",
      en: "Tackle what holds delivery back.",
    } as Localized<string>,
    intro: {
      fr: "Je dirige des équipes et je reste impliqué dans le code, les plateformes et la production. J'interviens lorsqu'un problème demande de regarder ces dimensions ensemble, pas d'appliquer une recette de plus.",
      en: "I lead teams and stay involved in code, platforms and production. I step in when a problem calls for looking at those dimensions together, rather than applying another ready-made playbook.",
    } as Localized<string>,
    asideLabel: { fr: "Sur le terrain", en: "In practice" },
    aside: {
      fr: "Je parle aux équipes, lis le code et regarde ce qui se passe en production. Le problème réel se trouve souvent dans l'écart entre ces trois réalités.",
      en: "I talk to teams, read the code and look at what happens in production. The real problem is often in the gaps between those three perspectives.",
    } as Localized<string>,
    asideLink: { fr: "Voir les réalisations", en: "Explore the work" },
  },
  situations: [
    {
      id: "delivery-slowdown",
      title: {
        fr: "Les équipes sont occupées. Les livraisons n'avancent plus.",
        en: "The teams are busy. Delivery keeps slipping.",
      },
      signal: {
        fr: "Les changements prennent trop de temps à passer du code à la production, malgré l'effort fourni.",
        en: "Changes take too long to travel from code to production, despite everyone's efforts.",
      },
      examines: {
        fr: "Responsabilités, coordination, feedback CI, dépendances et parcours réel des changements.",
        en: "Ownership, coordination, CI feedback, dependencies and the actual path to production.",
      },
      decision: {
        fr: "Ce qui doit être simplifié, automatisé ou arrêté, sans affaiblir la qualité.",
        en: "What to simplify, automate or stop doing without weakening quality.",
      },
      outcome: {
        fr: "Des priorités vérifiables et des changements que l'équipe peut maintenir.",
        en: "Priorities that can be checked and changes the team can sustain.",
      },
      related: {
        label: { fr: "REX sur la CI locale", en: "Local-first CI field report" },
        href: "/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre/",
      },
    },
    {
      id: "ops-absorbs-capacity",
      title: {
        fr: "L'exploitation prend le pas sur le développement.",
        en: "Operations crowd out engineering.",
      },
      signal: {
        fr: "Les incidents, les alertes et les interventions récurrentes occupent les équipes sans améliorer leur visibilité.",
        en: "Incidents, alerts and recurring interventions keep teams busy without improving visibility.",
      },
      examines: {
        fr: "Signaux réellement utiles, dette de plateforme, dépendances et manière d'exploiter.",
        en: "Useful signals, platform debt, dependencies and day-to-day operations.",
      },
      decision: {
        fr: "Où rétablir de la lisibilité et ce qu'il ne faut pas instrumenter inutilement.",
        en: "Where to restore visibility and what not to instrument needlessly.",
      },
      outcome: {
        fr: "Une exploitation plus lisible, avec des conventions que les équipes partagent.",
        en: "More legible operations, with conventions teams can share.",
      },
      related: {
        label: { fr: "REX OpenTelemetry 2/4", en: "OpenTelemetry field report 2/4" },
        href: "/thinking/2026-09-22-opentelemetry-instrumenter-200-services/",
      },
    },
    {
      id: "decision-blocked",
      title: {
        fr: "Le choix habituel ne répond plus au besoin.",
        en: "The usual approach no longer fits.",
      },
      signal: {
        fr: "La stack ou les pratiques en place sont devenues des contraintes, mais personne ne veut prendre le risque d'une alternative.",
        en: "Existing tools or practices have become constraints, but a different approach feels risky.",
      },
      examines: {
        fr: "Options concrètes, coût de changement, sécurité, maintenance et réversibilité.",
        en: "Real alternatives, switching costs, security, maintainability and reversibility.",
      },
      decision: {
        fr: "Conserver, adapter ou expérimenter autrement — avec des critères explicites.",
        en: "Keep, adapt or test a different approach, with explicit criteria.",
      },
      outcome: {
        fr: "Un choix documenté, un essai cadré et des conditions de poursuite ou d'arrêt.",
        en: "A documented choice, a bounded trial and clear go/no-go conditions.",
      },
    },
    {
      id: "unreadability",
      title: {
        fr: "Les responsabilités et les dépendances se brouillent.",
        en: "Ownership and dependencies have become unclear.",
      },
      signal: {
        fr: "Les équipes n'ont plus la même lecture du système ni de la manière dont elles doivent travailler ensemble.",
        en: "Teams no longer share a clear picture of the system or how they should work together.",
      },
      examines: {
        fr: "Frontières d'équipe, contrats entre composants, points de décision et transmission.",
        en: "Team boundaries, component contracts, decision points and knowledge transfer.",
      },
      decision: {
        fr: "Ce qu'il faut clarifier d'abord pour que les équipes reprennent la main.",
        en: "What to clarify first so teams can take back control.",
      },
      outcome: {
        fr: "Des responsabilités explicites et un plan que les personnes concernées comprennent.",
        en: "Clear ownership and a plan that the people involved understand.",
      },
      related: {
        label: { fr: "Conférences et ateliers", en: "Talks and workshops" },
        href: "/speaking/",
      },
    },
  ] satisfies WorkSituation[],
  method: {
    title: {
      fr: "Comprendre, éprouver, faire aboutir.",
      en: "Understand, test, follow through.",
    } as Localized<string>,
    intro: {
      fr: "La méthode n'est pas le produit. Elle doit s'adapter à la situation, et tenir face au terrain.",
      en: "The method is not the product. It needs to fit the situation and hold up in practice.",
    } as Localized<string>,
    steps: [
      {
        number: "01",
        title: { fr: "Voir le problème réel", en: "Find the real constraint" },
        body: {
          fr: "Écouter les équipes, examiner les systèmes et distinguer symptômes et causes.",
          en: "Listen to teams, examine the systems and separate symptoms from causes.",
        },
      },
      {
        number: "02",
        title: { fr: "Choisir et tester", en: "Choose and test" },
        body: {
          fr: "Comparer les réponses possibles. Sortir du cadre quand il le faut, sans abandonner les contrôles.",
          en: "Compare workable options. Challenge the playbook when needed, without losing the safeguards.",
        },
      },
      {
        number: "03",
        title: { fr: "Livrer et transmettre", en: "Deliver and transfer" },
        body: {
          fr: "Mettre en œuvre avec les équipes, vérifier ce qui change et laisser des pratiques qu'elles peuvent reprendre.",
          en: "Implement with the teams, check what changes and leave practices they can own.",
        },
      },
    ],
  },
  omnivyaNote: {
    fr: "Pour les missions, j'interviens via Omnivya, que j'ai cofondée avec Taous. Taous en assure la direction ; j'en suis CTO.",
    en: "For client engagements, I work through Omnivya, which I co-founded with Taous. Taous leads the company; I serve as CTO.",
  } as Localized<string>,
  cta: {
    title: {
      fr: "Vous avez une situation concrète à démêler ?",
      en: "Have a specific problem to work through?",
    } as Localized<string>,
    body: {
      fr: "Quelques lignes sur le contexte, les contraintes et ce qui doit changer suffisent pour commencer.",
      en: "A short account of the context, constraints and what needs to change is enough to start.",
    } as Localized<string>,
    contactLabel: { fr: "Prendre contact", en: "Get in touch" } as Localized<string>,
    omnivyaLabel: { fr: "Passer par Omnivya", en: "Contact Omnivya" } as Localized<string>,
  },
  labels: {
    situationsTitle: {
      fr: "Les situations sur lesquelles je travaille",
      en: "Where I get involved",
    } as Localized<string>,
    situationsIntro: {
      fr: "Il n'y a pas une technologie à vendre à chaque fois. Il y a une difficulté à comprendre et un résultat à rendre possible.",
      en: "Not every problem calls for another technology. The work starts by understanding what is actually in the way.",
    } as Localized<string>,
    examines: { fr: "Ce que je regarde", en: "What I examine" } as Localized<string>,
    decision: { fr: "Ce qu'on tranche", en: "What we decide" } as Localized<string>,
    outcome: { fr: "Ce qui doit changer", en: "What should change" } as Localized<string>,
    related: { fr: "À lire", en: "Related reading" } as Localized<string>,
    originalLanguage: { fr: "", en: "article in French" } as Localized<string>,
  },
} as const;
