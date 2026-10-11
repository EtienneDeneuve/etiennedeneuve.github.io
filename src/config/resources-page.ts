/**
 * /resources — page labels and display order only.
 * Titles, notes and links live on the resources collection entries.
 */

export type Localized = { fr: string; en: string };

export const resourcesPageConfig = {
  meta: {
    title: { fr: "Ressources", en: "Resources" } as Localized,
    description: {
      fr: "Livres blancs Omnivya, recommandations et liens utiles.",
      en: "Omnivya white papers, recommendations and useful links.",
    } as Localized,
    intro: {
      fr: "Quelques lectures utiles, avec le pourquoi. Les liens vont directement à la source.",
      en: "A few useful readings, with the why. Links go straight to the source.",
    } as Localized,
  },
  /** Collection entry ids in display order. */
  order: [
    "omnivya-hidden-costs-containers",
    "omnivya-hidden-face-of-iac",
    "DevSecOps",
    "TechSpresso",
  ] as const,
} as const;
