/**
 * Founder / Omnivya messaging (site perso — source exécutable).
 * Drift vs cash-factory-backlog/messaging.md is expected until that doc is updated separately.
 */

export type Localized = { fr: string; en: string };

export const messagingConfig = {
  etienne: {
    positioning: {
      fr: "Stratégie, organisation & transformation.",
      en: "Strategy, organisation & transformation.",
    } as Localized,
    promise: {
      fr: "Aider à décider sous contraintes réelles — humaines, organisationnelles et techniques — avec doctrine publique et preuves vérifiables.",
      en: "Help decide under real constraints — human, organisational and technical — with public doctrine and verifiable proof.",
    } as Localized,
    audiences: {
      dg: {
        fr: "Je clarifie les causes et le risque pour que la direction tranche sans dépendre d’un jargon opaque.",
        en: "I make causes and risk legible so leadership can decide without opaque jargon.",
      } as Localized,
      cto: {
        fr: "Doctrine, arbitrages documentés et leviers distincts (organisation, humain, technique) pour piloter sous contraintes.",
        en: "Doctrine, documented trade-offs and distinct levers (organisation, people, technology) for steering under constraints.",
      } as Localized,
      security: {
        fr: "Prioriser selon l’exposition et l’impact, pas selon le volume d’alertes.",
        en: "Prioritize by exposure and impact, not by alert volume.",
      } as Localized,
    },
    pitch: {
      sec10: {
        fr: "J’aide les directions et les CTO à trancher quand l’organisation, les équipes et la tech se mélangent. Doctrine et preuves sur mon site ; missions via Omnivya.",
        en: "I help leadership and CTOs decide when organisation, people and technology are entangled. Doctrine and proof on my site; missions through Omnivya.",
      } as Localized,
      sec30: {
        fr: "Je suis CTO conseil et CTO d’Omnivya. Je publie comment distinguer les causes humaines, organisationnelles et techniques, puis sécuriser la décision. Taous dirige Omnivya ; Omnivya Expert porte les missions bornées. Pas de staffing, pas de promesse magique : diagnostiquer, décider, accompagner.",
        en: "I am an advisory CTO and CTO of Omnivya. I publish how to separate human, organisational and technical causes, then secure the decision. Taous leads Omnivya; Omnivya Expert carries bounded missions. No staff-aug, no magic promise: diagnose, decide, support.",
      } as Localized,
      sec90: {
        fr: "Les organisations que je vois ont rarement un manque d’outils. Elles manquent d’une carte partagée, de critères de décision et d’un chemin qui ne confisque pas le contrôle. Sur etienne.deneuve.xyz je documente le raisonnement. Quand il faut une mission, Omnivya cadre le diagnostic et Omnivya Expert intervient dans un périmètre borné. On dit non au hors-scope et aux outcomes inventés.",
        en: "The organisations I see rarely lack tools. They lack a shared map, decision criteria and a path that does not seize control. At etienne.deneuve.xyz I document the reasoning. When a mission is needed, Omnivya frames the diagnosis and Omnivya Expert works in a bounded scope. We refuse out-of-scope work and invented outcomes.",
      } as Localized,
    },
    shortBio: {
      fr: "Etienne Deneuve est CTO conseil et CTO d’Omnivya, près de Paris. Il aide directions et équipes à comprendre les causes, éclairer les arbitrages et accompagner les transformations. Les missions structurées passent par Omnivya Expert. Il publie sur etienne.deneuve.xyz.",
      en: "Etienne Deneuve is an advisory CTO and CTO of Omnivya, near Paris. He helps leadership and teams understand causes, clarify trade-offs and support transformations. Structured missions run through Omnivya Expert. He publishes at etienne.deneuve.xyz.",
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
