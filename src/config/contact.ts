import { siteConfig } from "./site.ts";

export type Localized = { fr: string; en: string };

export type ContactIntentId = "mission" | "partnership" | "speaking-media" | "technical";

export type ContactIntent = {
  id: ContactIntentId;
  title: Localized;
  summary: Localized;
  emailSubject: Localized;
  fields: Localized[];
  eventIntent: string;
};

function mailto(subject: string): string {
  return `mailto:${siteConfig.omnivya.email}?subject=${encodeURIComponent(subject)}`;
}

export const contactConfig = {
  meta: {
    title: { fr: "Contact", en: "Contact" } as Localized,
    description: {
      fr: "Quatre intentions claires pour démarrer une conversation utile — sans formulaire serveur.",
      en: "Four clear intents to start a useful conversation — no server form.",
    } as Localized,
    intro: {
      fr: "Choisissez une intention. L’email est le canal principal. Le calendrier Omnivya reste une action secondaire.",
      en: "Pick an intent. Email is the primary channel. The Omnivya calendar remains a secondary action.",
    } as Localized,
  },
  calendar: {
    label: {
      fr: "Ouverture du calendrier Omnivya",
      en: "Open Omnivya calendar",
    } as Localized,
    note: {
      fr: "Action secondaire — utile pour un créneau court après un premier message.",
      en: "Secondary action — useful for a short slot after a first message.",
    } as Localized,
    href: siteConfig.omnivya.contactPage,
  },
  labels: {
    includeInEmail: {
      fr: "À inclure dans l’email",
      en: "Include in the email",
    } as Localized,
    writeEmail: {
      fr: "Écrire un email",
      en: "Write an email",
    } as Localized,
    emailAddress: {
      fr: "Adresse",
      en: "Address",
    } as Localized,
  },
  intents: [
    {
      id: "mission",
      title: {
        fr: "Diagnostic ou mission",
        en: "Diagnosis or mission",
      },
      summary: {
        fr: "Pour qualifier un contexte SI complexe avant engagement.",
        en: "To qualify a complex IT context before engagement.",
      },
      emailSubject: {
        fr: "Contact — diagnostic ou mission",
        en: "Contact — diagnosis or mission",
      },
      fields: [
        { fr: "Contexte", en: "Context" },
        { fr: "Système concerné", en: "System concerned" },
        { fr: "Problème observable", en: "Observable problem" },
        { fr: "Décision à prendre", en: "Decision to make" },
        { fr: "Échéance", en: "Deadline" },
        { fr: "Contraintes de confidentialité", en: "Confidentiality constraints" },
      ],
      eventIntent: "mission",
    },
    {
      id: "partnership",
      title: {
        fr: "Partenariat",
        en: "Partnership",
      },
      summary: {
        fr: "Pour une collaboration structurée (produit, distribution, co-construction).",
        en: "For a structured collaboration (product, distribution, co-building).",
      },
      emailSubject: {
        fr: "Contact — partenariat",
        en: "Contact — partnership",
      },
      fields: [
        { fr: "Organisation et rôle", en: "Organization and role" },
        { fr: "Nature du partenariat envisagé", en: "Nature of the intended partnership" },
        { fr: "Périmètre et valeur attendue", en: "Scope and expected value" },
        { fr: "Géographie (France, Algérie, autre)", en: "Geography (France, Algeria, other)" },
        { fr: "Prochaine étape souhaitée", en: "Desired next step" },
      ],
      eventIntent: "partnership",
    },
    {
      id: "speaking-media",
      title: {
        fr: "Conférence ou média",
        en: "Conference or media",
      },
      summary: {
        fr: "Pour une keynote, panel, workshop, briefing ou interview.",
        en: "For a keynote, panel, workshop, briefing or interview.",
      },
      emailSubject: {
        fr: "Contact — conférence ou média",
        en: "Contact — conference or media",
      },
      fields: [
        { fr: "Événement ou média", en: "Event or media outlet" },
        { fr: "Format (keynote, panel, podcast…)", en: "Format (keynote, panel, podcast…)" },
        { fr: "Audience et langue", en: "Audience and language" },
        { fr: "Date et lieu (ou remote)", en: "Date and location (or remote)" },
        {
          fr: "Sujet envisagé parmi les thèmes Speaking",
          en: "Intended topic among Speaking themes",
        },
      ],
      eventIntent: "speaking_media",
    },
    {
      id: "technical",
      title: {
        fr: "Échange technique précis",
        en: "Specific technical exchange",
      },
      summary: {
        fr: "Pour une question ciblée sur un article, un projet ou un composant open source.",
        en: "For a focused question on an article, project or open-source component.",
      },
      emailSubject: {
        fr: "Contact — échange technique",
        en: "Contact — technical exchange",
      },
      fields: [
        { fr: "Lien vers le contenu ou le dépôt", en: "Link to the content or repository" },
        { fr: "Question précise", en: "Specific question" },
        { fr: "Contexte d’usage", en: "Usage context" },
        { fr: "Ce que vous avez déjà essayé", en: "What you already tried" },
      ],
      eventIntent: "technical",
    },
  ] satisfies ContactIntent[],
  buildMailto(subject: string) {
    return mailto(subject);
  },
} as const;
