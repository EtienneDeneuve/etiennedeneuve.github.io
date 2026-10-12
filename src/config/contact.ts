import { omnivyaContactUrl, siteConfig } from "./site.ts";

export type Localized = { fr: string; en: string };

/** /contact: personal conversation, public speaking and Omnivya engagements. */
export const contactConfig = {
  meta: {
    title: { fr: "Contact", en: "Contact" } as Localized,
    eyebrow: { fr: "CTO expert · Contact", en: "Hands-on CTO · Contact" } as Localized,
    headline: {
      fr: "Commençons par le sujet.",
      en: "Start with the question.",
    } as Localized,
    description: {
      fr: "Une mission, une conférence ou un échange technique ? Choisir le bon canal pour joindre Étienne Deneuve.",
      en: "An engagement, a speaking invitation or a technical conversation? Find the right way to reach Étienne Deneuve.",
    } as Localized,
    intro: {
      fr: "Une mission à cadrer, une conférence à préparer, un point de vue à confronter : ces conversations n'appellent pas toutes le même parcours.",
      en: "An engagement to scope, a talk to prepare, a technical view to challenge: not every conversation belongs in the same process.",
    } as Localized,
    asideLabel: {
      fr: "Deux rôles, un cadre explicite",
      en: "Two roles, one clear distinction",
    } as Localized,
    aside: {
      fr: "Ici, j'écris en mon nom. Pour les missions, j'interviens via Omnivya, cofondée avec Taous, qui en assure la direction. J'en suis CTO.",
      en: "I write here in my own name. Client engagements run through Omnivya, which I co-founded with Taous, who leads the company. I serve as CTO.",
    } as Localized,
    asideLink: { fr: "Voir l'accompagnement", en: "Explore engagements" },
    pathwaysTitle: {
      fr: "Quel échange souhaitez-vous engager ?",
      en: "What would you like to discuss?",
    } as Localized,
    pathwaysIntro: {
      fr: "Je préfère que l'intention soit claire dès le départ. Pas de formulaire imposé pour une simple discussion.",
      en: "It helps to be clear about the intent. A simple conversation should not require a qualification funnel.",
    } as Localized,
    footer: {
      fr: "Pour une question ponctuelle, l'email reste possible. Le lien GitHub est réservé aux échanges autour des projets publics.",
      en: "Email also works for an individual question. GitHub is best kept for discussions about public projects.",
    } as Localized,
  },
  mission: {
    title: {
      fr: "Mission, workshop ou formation professionnelle",
      en: "Engagement, workshop or professional training",
    } as Localized,
    body: {
      fr: "Direction technique, amélioration du delivery, architecture, expérimentation ou transmission : si l'intervention engage un périmètre et des livrables, elle passe par Omnivya.",
      en: "Technology leadership, better engineering delivery, architecture, experimentation or training: if the work requires an agreed scope and deliverables, it runs through Omnivya.",
    } as Localized,
    cta: {
      fr: "Parler du besoin via Omnivya",
      en: "Discuss the brief through Omnivya",
    } as Localized,
    note: {
      fr: "Décrivez l'objectif, les contraintes et ce qui ne fonctionne plus. Inutile de prescrire une technologie.",
      en: "Describe the intended outcome, constraints and what is getting in the way. No need to prescribe a technology.",
    } as Localized,
    hrefFor: (lang: "fr" | "en") => omnivyaContactUrl(lang, "contact-page"),
  },
  speaking: {
    title: {
      fr: "Conférence, podcast ou intervention média",
      en: "Conference, podcast or media invitation",
    } as Localized,
    body: {
      fr: "Pour parler de production, d'équipes, d'engineering ou des choix derrière mes retours de terrain, un email suffit. Indiquez le public et le format envisagés.",
      en: "For a conversation about production, teams, engineering or the choices behind my field reports, an email is enough. Mention the audience and proposed format.",
    } as Localized,
    cta: { fr: "Proposer une intervention", en: "Invite me to speak" } as Localized,
    note: {
      fr: "Conférences et médias : contact direct. Workshops et formations payants : cadrage via Omnivya.",
      en: "Talks and media: direct contact. Paid workshops and training: scoped through Omnivya.",
    } as Localized,
    subject: {
      fr: "Proposition d'intervention — etienne.deneuve.xyz",
      en: "Speaking invitation — etienne.deneuve.xyz",
    } as Localized,
  },
  other: {
    title: {
      fr: "Discussion entre pairs",
      en: "A conversation between peers",
    } as Localized,
    body: {
      fr: "Une question sur un article, une approche à challenger ou simplement l'envie d'échanger ? Retrouvez-moi sur LinkedIn, sans détour commercial.",
      en: "A question about an article, an approach worth challenging or just an exchange of ideas? Find me on LinkedIn, without a sales process.",
    } as Localized,
    cta: { fr: "Échanger sur LinkedIn", en: "Connect on LinkedIn" } as Localized,
    subject: {
      fr: "Contact — etienne.deneuve.xyz",
      en: "Contact — etienne.deneuve.xyz",
    } as Localized,
  },
  email: siteConfig.omnivya.email,
  buildMailto(subject: string) {
    return "mailto:" + siteConfig.omnivya.email + "?subject=" + encodeURIComponent(subject);
  },
} as const;
