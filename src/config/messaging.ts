/**
 * Founder / Omnivya messaging kit (#111).
 * Keep in sync with cash-factory-backlog/messaging.md
 */

export type Localized = { fr: string; en: string };

export const messagingConfig = {
  etienne: {
    positioning: {
      fr: "Rendre les plateformes cloud lisibles, fiables et gouvernables.",
      en: "Make cloud platforms readable, reliable and governable.",
    } as Localized,
    promise: {
      fr: "Aider à décider sous contraintes réelles, avec doctrine publique et preuves vérifiables.",
      en: "Help decide under real constraints, with public doctrine and verifiable proof.",
    } as Localized,
    audiences: {
      dg: {
        fr: "Je clarifie le risque système pour que la direction tranche sans dépendre d’un jargon opaque.",
        en: "I make system risk legible so leadership can decide without opaque jargon.",
      } as Localized,
      cto: {
        fr: "Doctrine, cartes de système et arbitrages documentés pour piloter un SI sous contraintes.",
        en: "Doctrine, system maps and documented trade-offs for steering an estate under constraints.",
      } as Localized,
      rssi: {
        fr: "Prioriser selon l’exposition et l’impact, pas selon le volume d’alertes.",
        en: "Prioritise by exposure and impact, not by alert volume.",
      } as Localized,
    },
    pitch: {
      sec10: {
        fr: "J’aide les CTO à trancher sur des plateformes cloud quand le risque et la complexité bloquent. Doctrine et preuves sur mon site ; missions via Omnivya.",
        en: "I help CTOs decide on cloud platforms when risk and complexity block progress. Doctrine and proof on my site; missions through Omnivya.",
      } as Localized,
      sec30: {
        fr: "Je suis CTO d’Omnivya. Je publie comment on lit un SI sous contraintes, puis on sécurise la décision. Taous dirige Omnivya ; Omnivya Expert porte les missions bornées. Pas de staffing, pas de promesse magique : un cadre pour diagnostiquer, décider, construire.",
        en: "I am CTO of Omnivya. I publish how to read an estate under constraints, then secure the decision. Taous leads Omnivya; Omnivya Expert carries bounded missions. No staff-aug, no magic promise: a frame to diagnose, decide, build.",
      } as Localized,
      sec90: {
        fr: "Les organisations que je vois ont rarement un manque d’outils. Elles manquent d’une carte partagée, de critères de décision et d’un chemin d’exécution qui ne confisque pas le contrôle. Sur etienne.deneuve.xyz je documente le raisonnement. Quand il faut une mission, Omnivya cadre le diagnostic et Omnivya Expert exécute dans un périmètre borné, en Europe et en Afrique. On dit non au hors-scope et aux outcomes inventés.",
        en: "The organisations I see rarely lack tools. They lack a shared map, decision criteria and an execution path that does not seize control. At etienne.deneuve.xyz I document the reasoning. When a mission is needed, Omnivya frames the diagnosis and Omnivya Expert executes in a bounded scope, across Europe and Africa. We refuse out-of-scope work and invented outcomes.",
      } as Localized,
    },
    shortBio: {
      fr: "Etienne Deneuve est Platform Reliability Architect et CTO d’Omnivya, près de Paris. Il aide les équipes à décider et à rendre gouvernables des plateformes cloud sous contraintes réelles. Les missions structurées passent par Omnivya Expert. Il publie sur etienne.deneuve.xyz.",
      en: "Etienne Deneuve is a Platform Reliability Architect and CTO of Omnivya, near Paris. He helps teams decide and make cloud platforms governable under real constraints. Structured missions run through Omnivya Expert. He publishes at etienne.deneuve.xyz.",
    } as Localized,
  },
  omnivya: {
    positioning: {
      fr: "Trancher une décision cloud risquée, sans confisquer le contrôle.",
      en: "Make a hard cloud decision without giving up control.",
    } as Localized,
    promise: {
      fr: "Cadre pour diagnostiquer, décider et construire une plateforme fiable, avec engagement clair.",
      en: "A frame to diagnose, decide and build a reliable platform, with a clear engagement.",
    } as Localized,
  },
  omnivyaExpert: {
    positioning: {
      fr: "Missions bornées : diagnostiquer, décider, construire ou gouverner.",
      en: "Bounded missions: diagnose, decide, build or govern.",
    } as Localized,
  },
} as const;
