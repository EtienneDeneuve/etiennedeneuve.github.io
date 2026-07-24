import { getChronology, getMetaDescription, getShortDescription } from "../data/ecosystem.ts";

type Localized = { fr: string; en: string };

const chronologyFr = getChronology("fr");
const chronologyEn = getChronology("en");

/**
 * Canonical ecosystem page copy.
 * Narrative source of truth: `src/data/ecosystem.ts`.
 */
export const ecosystemPageConfig = {
  meta: {
    title: { fr: "Écosystème Omnivya", en: "Omnivya ecosystem" } as Localized,
    description: {
      fr: getMetaDescription("omnivya", "fr"),
      en: getMetaDescription("omnivya", "en"),
    } as Localized,
    eyebrow: { fr: "Référence", en: "Reference" } as Localized,
  },
  definition: {
    title: { fr: "En deux phrases", en: "In two sentences" } as Localized,
    paragraphs: {
      fr: [
        "Omnivya est le hub commun qui rassemble les activités de Taous et moi.",
        "Omnivya Expert porte les services et la delivery en Europe et en Afrique, tandis que My Dare, Sanad et les projets open source répondent à des besoins spécifiques rencontrés sur le terrain.",
      ],
      en: [
        "Omnivya is the shared hub that gathers Taous’s and my activities.",
        "Omnivya Expert carries services and delivery in Europe and Africa, while My Dare, Sanad and open-source projects answer specific needs met in the field.",
      ],
    },
  },
  howBuilt: {
    title: {
      fr: "Comment l’écosystème s’est construit",
      en: "How the ecosystem was built",
    } as Localized,
    paragraphs: {
      fr: [
        "Taous et moi avons créé Simplifi’ED le 4 août 2020 pour porter le conseil et l’ingénierie en Europe. L’Algérie n’était pas dans le plan d’origine.",
        "Face surtout à la pénurie de profils techniques en Europe, nous avons ensuite décidé de constituer une capacité de delivery en Algérie. La filiale s’appelait historiquement IT Challenge — SARL toujours active ; le nom n’est plus une marque publique, il apparaît surtout en facturation.",
        "My Dare est venu pour disposer à Alger d’un environnement de travail adapté aux équipes et à la manière de travailler du groupe. Sanad est né du manque d’un SaaS local pour devis, factures et contrats.",
        "Les activités de services françaises et algériennes sont aujourd’hui regroupées sous Omnivya Expert. Depuis 2025, la marque Omnivya structure le hub commun.",
      ],
      en: [
        "Taous and I founded Simplifi’ED on 4 August 2020 for consulting and engineering in Europe. Algeria was not in the original plan.",
        "Mainly because of the shortage of technical profiles in Europe, we later decided to build delivery capacity in Algeria. The subsidiary was historically named IT Challenge — the SARL is still active; the name is no longer a public brand and mostly appears on invoices.",
        "My Dare came next so the group’s teams in Algiers would have a suitable workspace and way of working. Sanad grew from the lack of local SaaS for quotes, invoices and contracts.",
        "French and Algerian services activities are now gathered under Omnivya Expert. Since 2025, the Omnivya brand structures the shared hub.",
      ],
    },
  },
  structure: {
    title: { fr: "Structure actuelle", en: "Current structure" } as Localized,
    intro: {
      fr: "Ce que chaque nom désigne aujourd’hui.",
      en: "What each name means today.",
    } as Localized,
    items: [
      {
        id: "omnivya",
        name: { fr: "Omnivya", en: "Omnivya" } as Localized,
        role: {
          fr: getShortDescription("omnivya", "fr"),
          en: getShortDescription("omnivya", "en"),
        } as Localized,
        href: { fr: "/projects/omnivya/", en: "/en/projects/omnivya/" } as Localized,
      },
      {
        id: "omnivya-expert",
        name: { fr: "Omnivya Expert", en: "Omnivya Expert" } as Localized,
        role: {
          fr: getShortDescription("omnivya-expert", "fr"),
          en: getShortDescription("omnivya-expert", "en"),
        } as Localized,
        href: { fr: "/projects/omnivya/", en: "/en/projects/omnivya/" } as Localized,
      },
      {
        id: "my-dare",
        name: { fr: "My Dare", en: "My Dare" } as Localized,
        role: {
          fr: getShortDescription("my-dare", "fr"),
          en: getShortDescription("my-dare", "en"),
        } as Localized,
        href: { fr: "/projects/my-dare/", en: "/en/projects/my-dare/" } as Localized,
      },
      {
        id: "sanad",
        name: { fr: "Sanad", en: "Sanad" } as Localized,
        role: {
          fr: getShortDescription("sanad", "fr"),
          en: getShortDescription("sanad", "en"),
        } as Localized,
        href: { fr: "/projects/sanad/", en: "/en/projects/sanad/" } as Localized,
      },
      {
        id: "open-source",
        name: { fr: "Open source", en: "Open source" } as Localized,
        role: {
          fr: getShortDescription("open-source", "fr"),
          en: getShortDescription("open-source", "en"),
        } as Localized,
        href: {
          fr: "/projects/external-metrics-exporter/",
          en: "/en/projects/external-metrics-exporter/",
        } as Localized,
      },
    ],
  },
  historical: {
    title: { fr: "Noms historiques", en: "Historical names" } as Localized,
    paragraphs: {
      fr: [
        "Simplifi’ED était le nom historique de l’activité française de services.",
        "IT Challenge était le nom historique de la filiale algérienne (SARL toujours active ; nom surtout en facturation).",
        "Ces activités sont aujourd’hui regroupées sous Omnivya Expert. Les noms restent dans l’histoire et dans certains artefacts (factures, org GitHub) ; ils ne sont plus des marques stratégiques publiques.",
      ],
      en: [
        "Simplifi’ED was the historical name of the French services activity.",
        "IT Challenge was the historical name of the Algerian subsidiary (SARL still active; name mostly for invoicing).",
        "Those activities are now gathered under Omnivya Expert. The names remain in the history and in some artifacts (invoices, GitHub org); they are no longer public strategic brands.",
      ],
    },
  },
  timeline: {
    title: { fr: "Chronologie", en: "Timeline" } as Localized,
    intro: {
      fr: "Repères confirmés uniquement. Les étapes sans date restent relatives.",
      en: "Confirmed markers only. Undated steps stay relative.",
    } as Localized,
    steps: chronologyFr.map((step, index) => ({
      id: step.id,
      date: step.date,
      title: { fr: step.title, en: chronologyEn[index].title } as Localized,
      summary: { fr: step.summary, en: chronologyEn[index].summary } as Localized,
    })),
  },
  links: {
    title: { fr: "Aller plus loin", en: "Go further" } as Localized,
    items: [
      {
        label: { fr: "About", en: "About" } as Localized,
        href: { fr: "/about/", en: "/en/about/" } as Localized,
        hint: {
          fr: "Taous, parcours et chronologie personnelle",
          en: "Taous, path and personal timeline",
        } as Localized,
      },
      {
        label: { fr: "Start Here", en: "Start Here" } as Localized,
        href: { fr: "/start-here/", en: "/en/start-here/" } as Localized,
        hint: {
          fr: "Orientation pour cadrer un SI complexe",
          en: "Orientation to frame a complex estate",
        } as Localized,
      },
      {
        label: { fr: "Projects", en: "Projects" } as Localized,
        href: { fr: "/projects/", en: "/en/projects/" } as Localized,
        hint: {
          fr: "Preuves publiques détaillées",
          en: "Detailed public proof entries",
        } as Localized,
      },
      {
        label: { fr: "Omnivya.fr", en: "Omnivya.fr" } as Localized,
        href: { fr: "https://www.omnivya.fr", en: "https://www.omnivya.fr" } as Localized,
        hint: {
          fr: "Détail commercial et offres",
          en: "Commercial detail and offers",
        } as Localized,
        external: true,
      },
    ],
  },
} as const;
