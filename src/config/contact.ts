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
      fr: "Échanger directement : mission via Omnivya, ou email pour tout autre sujet.",
      en: "Reach out directly: mission via Omnivya, or email for anything else.",
    } as Localized,
    intro: {
      fr: "Deux chemins suffisent. Pas de formulaire à plusieurs intentions.",
      en: "Two paths are enough. No multi-intent form.",
    } as Localized,
  },
  mission: {
    title: { fr: "Mission ou accompagnement", en: "Mission or advisory" } as Localized,
    body: {
      fr: "Pour qualifier une situation et cadrer une mission, le canal est Omnivya.",
      en: "To qualify a situation and frame a mission, the channel is Omnivya.",
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
