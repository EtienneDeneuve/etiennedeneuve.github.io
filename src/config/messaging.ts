/**
 * Founder / Omnivya messaging (site perso — source exécutable).
 * Drift vs cash-factory-backlog/messaging.md is expected until that doc is updated separately.
 */

export type Localized = { fr: string; en: string };

export const messagingConfig = {
  etienne: {
    positioning: {
      fr: "CTO expert.",
      en: "Hands-on CTO.",
    } as Localized,
    promise: {
      fr: "Diriger les équipes, maîtriser les systèmes et améliorer ce qui compte. Les décisions techniques ont une valeur lorsqu’elles changent réellement la situation.",
      en: "Lead teams, understand the systems and improve what matters. Technology decisions earn their value through real-world impact.",
    } as Localized,
    audiences: {
      dg: {
        fr: "J’identifie ce qui freine les équipes et les systèmes, clarifie les options puis accompagne les décisions jusque dans leur mise en œuvre.",
        en: "I identify what holds teams and systems back, make the options clear and see decisions through to delivery.",
      } as Localized,
      cto: {
        fr: "Je travaille sur l’organisation, le code et la plateforme ensemble lorsque le problème l’exige. Pas de refonte par principe ni de technologie imposée.",
        en: "I work across teams, software and platforms when the problem calls for it. No default rewrite and no tool imposed for its own sake.",
      } as Localized,
      security: {
        fr: "Je pars des dépendances et des conséquences réelles, plutôt que du nombre d’alertes ou de contrôles affichés.",
        en: "I focus on real dependencies and consequences, not the volume of alerts or controls on a dashboard.",
      } as Localized,
    },
    pitch: {
      sec10: {
        fr: "Je dirige des équipes et je reste sur le terrain technique. J’interviens là où les pratiques, le code ou les plateformes empêchent d’avancer.",
        en: "I lead teams and stay close to the technology. I work where existing practices, software or platforms are holding delivery back.",
      } as Localized,
      sec30: {
        fr: "Je suis CTO expert et j’ai cofondé Omnivya avec Taous. Je dirige des équipes, j’interviens dans le code et les plateformes, et je m’attaque à ce qui freine réellement le travail. Quand une pratique a fait son temps, je la remets en question, j’éprouve une alternative et je vérifie ses limites. Je documente ce travail sur mon blog ; les missions sont menées via Omnivya.",
        en: "I am a hands-on CTO and co-founded Omnivya with Taous. I lead teams, work in the code and on platforms, and tackle what genuinely gets in the way of delivery. When established practices fall short, I challenge them, test alternatives and examine the limits. I write about that work here; engagements run through Omnivya.",
      } as Localized,
      sec90: {
        fr: "Une bonne décision technique doit tenir face au terrain. Sur une application de quinze ans, nous avons choisi de déployer un socle OpenTelemetry commun sur un périmètre d’environ 200 services plutôt que de lancer une refonte générale. Sur nos projets, nous rapprochons les validations CI du développeur sans affaiblir les contrôles GitHub. Ce sont des réponses différentes à des problèmes différents. Ce qui ne change pas : comprendre les contraintes, travailler avec les équipes, limiter les risques, vérifier les effets et transmettre ce que nous apprenons. Je suis CTO expert et cofondateur d’Omnivya avec Taous, qui en assure la direction. J’écris ces retours de terrain sur etienne.deneuve.xyz.",
        en: "Technical decisions have to survive contact with production. For a fifteen-year-old application, we chose a common OpenTelemetry baseline across a scope of roughly 200 services instead of a broad rewrite. On our projects, we bring CI checks closer to developers without weakening GitHub's merge controls. Different problems call for different answers. What remains constant is understanding constraints, working with teams, managing risks, checking the effects and sharing what we learn. I am a hands-on CTO and co-founder of Omnivya with Taous, who leads the business. I publish the field notes on etienne.deneuve.xyz.",
      } as Localized,
    },
    shortBio: {
      fr: "Étienne Deneuve est CTO expert, cofondateur et CTO d’Omnivya. Il dirige des équipes et intervient du code aux plateformes Cloud, avec une attention particulière à l’efficacité de l’ingénierie. Il partage ses retours d’expérience dans des articles, conférences, ateliers et formations.",
      en: "Étienne Deneuve is a hands-on CTO and co-founder of Omnivya. He leads teams and works from software to cloud platforms, with a focus on effective engineering delivery. He shares his field experience through writing, speaking, workshops and training.",
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
