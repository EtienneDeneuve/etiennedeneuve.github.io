import { omnivyaContactUrl, siteConfig } from "./site.ts";

export type Localized = { fr: string; en: string };

/**
 * /contact — direct contact; mission vs other exchange.
 * Not a multi-intent qualification form.
 */
export const contactConfig = {
  meta: {
    title: { fr: "Contact", en: "Contact" } as Localized,
    description: {
      fr: "Décrivez votre situation en quelques lignes : mission via Omnivya, ou email pour tout autre sujet.",
      en: "Describe your situation in a few lines: mission via Omnivya, or email for anything else.",
    } as Localized,
    intro: {
      fr: "Décrivez votre situation en quelques lignes.",
      en: "Describe your situation in a few lines.",
    } as Localized,
  },
  mission: {
    title: { fr: "Mission ou accompagnement", en: "Mission or advisory" } as Localized,
    body: {
      fr: "Pour une mission ou un accompagnement structuré, contactez Omnivya.",
      en: "For a structured mission or advisory engagement, contact Omnivya.",
    } as Localized,
    cta: {
      fr: "Contacter Omnivya",
      en: "Contact Omnivya",
    } as Localized,
    hrefFor: (lang: "fr" | "en") => omnivyaContactUrl(lang, "contact-page"),
  },
  other: {
    title: { fr: "Autre échange", en: "Other exchange" } as Localized,
    body: {
      fr: "Conférence, média, partenariat, question technique ou simple prise de contact : un email suffit. Quelques lignes sur le contexte aident.",
      en: "Talk, media, partnership, technical question or a simple hello: email is enough. A few lines of context help.",
    } as Localized,
    cta: { fr: "Écrire un email", en: "Write an email" } as Localized,
    subject: {
      fr: "Contact — etienne.deneuve.xyz",
      en: "Contact — etienne.deneuve.xyz",
    } as Localized,
  },
  email: siteConfig.omnivya.email,
  buildMailto(subject: string) {
    return `mailto:${siteConfig.omnivya.email}?subject=${encodeURIComponent(subject)}`;
  },
} as const;
