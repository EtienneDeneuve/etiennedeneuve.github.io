/**
 * Home-only UI copy. Shared identity / role / positioning live in site.ts
 * and messaging.ts — reference them from the component, do not duplicate here.
 * Current positioning and editorial contract: cash-factory-backlog #173.
 * The older cto-cursor-kit documents are historical reference, not live copy.
 */

export type HomeLocaleCopy = {
  eyebrow: string;
  headlineAccent: string;
  tagline: string;
  lede: string;
  ctaMission: string;
  ctaMissionExternalHint: string;
  ctaContext: string;
  domains: readonly string[];
  approach: {
    eyebrow: string;
    titleFirst: string;
    titleSecond: string;
    intro: string;
    steps: readonly { number: string; title: string; body: string }[];
    completeLabel: string;
    completePath: string;
  };
  technicalDepth: {
    title: string;
    body: string;
    cta: string;
    ctaPath: string;
  };
  publicationsTitle: string;
  publicationsAll: string;
  publicationsEmpty: string;
  readArticle: string;
  portraitAlt: string;
};

export const homeConfig: { fr: HomeLocaleCopy; en: HomeLocaleCopy } = {
  fr: {
    eyebrow: "CTO · Architecture · Plateformes critiques",
    headlineAccent: "Débloquer les décisions qui empêchent d’avancer.",
    tagline:
      "Du management au code, une même exigence : faire avancer les équipes et leurs systèmes.",
    lede: "Je travaille là où une décision technique bloque réellement le delivery : architecture cloud, Kubernetes, observabilité, DevSecOps, organisation et engineering. Le but n’est pas d’ajouter une couche de conseil, mais de rendre le problème explicite, trancher avec les équipes et vérifier ce qui change en production.",
    ctaMission: "Parler d’un blocage concret",
    ctaMissionExternalHint: "↗",
    ctaContext:
      "Pour les missions, j’interviens via Omnivya, que j’ai cofondée avec Taous et dont je suis CTO.",
    domains: [
      "Diriger et faire progresser les équipes",
      "Réduire les frictions du delivery",
      "Du code aux plateformes Cloud",
      "Former, animer, transmettre",
    ],
    approach: {
      eyebrow: "Ma manière de travailler",
      titleFirst: "Comprendre ce qui bloque.",
      titleSecond: "Aller jusqu’à l’exécution.",
      intro:
        "Une question guide le travail : qu’est-ce qui doit réellement changer ? La réponse peut être humaine, organisationnelle ou technique. Souvent les trois.",
      steps: [
        {
          number: "01",
          title: "Cadrer le problème",
          body: "Identifier le résultat attendu, les contraintes et les points de friction.",
        },
        {
          number: "02",
          title: "Comparer les options",
          body: "Retenir ce qui répond au besoin, même lorsque cela remet en cause les pratiques établies.",
        },
        {
          number: "03",
          title: "Faire la preuve",
          body: "Exécuter avec les équipes, maintenir les contrôles et vérifier les effets.",
        },
      ],
      completeLabel: "Voir l’accompagnement",
      completePath: "/work/",
    },
    technicalDepth: {
      title: "Environ 200 services instrumentés sans réécrire l’application.",
      body: "Pour déployer OpenTelemetry, nous avons préféré un socle commun à une refonte générale. Avec la R&D : conventions, ateliers, petites PR et vérification des traces. Ce retour terrain explique aussi ce que nous n’avons pas cherché à faire.",
      cta: "Lire le retour d’expérience OpenTelemetry",
      ctaPath: "/thinking/2026-09-22-opentelemetry-instrumenter-200-services/",
    },
    publicationsTitle: "Publications",
    publicationsAll: "Tout lire",
    publicationsEmpty: "",
    readArticle: "Lire l’article",
    portraitAlt: "Portrait d’Étienne Deneuve",
  },
  en: {
    eyebrow: "CTO · Architecture · Critical platforms",
    headlineAccent: "Unblock decisions that keep teams from moving.",
    tagline: "I help CTOs and CIOs when platform complexity, organisation or technical debt makes every change feel too risky.",
    lede: "I work where a technical decision is genuinely blocking delivery: cloud architecture, Kubernetes, observability, DevSecOps, organisation and engineering. The goal is not to add another layer of consulting, but to make the problem explicit, decide with the teams and verify what changes in production.",
    ctaMission: "Discuss a concrete blocker",
    ctaMissionExternalHint: "↗",
    ctaContext:
      "For professional engagements, I work through Omnivya, which I co-founded with Taous and where I serve as CTO.",
    domains: [
      "Lead and develop engineering teams",
      "Remove friction from delivery",
      "From software to cloud platforms",
      "Speak, teach and run workshops",
    ],
    approach: {
      eyebrow: "How I work",
      titleFirst: "Understand what is holding things back.",
      titleSecond: "Follow through on delivery.",
      intro:
        "One question comes first: what actually needs to change? The answer may involve people, the organisation or technology. Often all three.",
      steps: [
        {
          number: "01",
          title: "Define the problem",
          body: "Make the intended result, constraints and sources of friction explicit.",
        },
        {
          number: "02",
          title: "Examine the options",
          body: "Choose what fits, even when it challenges established practices.",
        },
        {
          number: "03",
          title: "Prove the change",
          body: "Deliver with the teams, keep the safeguards and verify what changed.",
        },
      ],
      completeLabel: "See advisory",
      completePath: "/work/",
    },
    technicalDepth: {
      title: "Around 200 services instrumented without rewriting the application.",
      body: "For the OpenTelemetry rollout, we chose a shared baseline over a broad rewrite. Working with R&D meant common conventions, workshops, focused PRs and checking what the traces actually showed.",
      cta: "Read the OpenTelemetry field report (FR)",
      ctaPath: "/thinking/2026-09-22-opentelemetry-instrumenter-200-services/",
    },
    publicationsTitle: "Publications",
    publicationsAll: "Read all",
    publicationsEmpty:
      "No English notes yet. The Thinking index has the full library, mostly in French.",
    readArticle: "Read the article",
    portraitAlt: "Portrait of Étienne Deneuve",
  },
} as const;
