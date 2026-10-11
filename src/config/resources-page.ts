/**
 * Compact /resources/ — curated recommendations with direct links.
 * No /resources/all duplicate; no transit cards for whitepapers.
 */

export type Localized = { fr: string; en: string };

export type ResourceRecommendation = {
  id: string;
  title: Localized;
  note: Localized;
  links: Array<{ label: Localized; href: string }>;
};

export const resourcesPageConfig = {
  meta: {
    title: { fr: "Ressources", en: "Resources" } as Localized,
    description: {
      fr: "Livres blancs Omnivya, recommandations et liens utiles — sans bibliothèque artificielle.",
      en: "Omnivya white papers, recommendations and useful links — no artificial library.",
    } as Localized,
    intro: {
      fr: "Quelques lectures utiles, avec le pourquoi. Les liens vont directement à la source.",
      en: "A few useful readings, with the why. Links go straight to the source.",
    } as Localized,
  },
  items: [
    {
      id: "hidden-costs-containers",
      title: {
        fr: "Les coûts cachés des images de conteneurs",
        en: "The hidden costs of container images",
      },
      note: {
        fr: "Livre blanc Omnivya : comment un surplus de poids d’image impacte CI/CD, registries, clusters, sécurité et carbone.",
        en: "Omnivya white paper: how excess image weight hits CI/CD, registries, clusters, security and carbon.",
      },
      links: [
        {
          label: { fr: "Lire en français", en: "Read in French" },
          href: "https://www.omnivya.fr/fr/whitepapers/hidden-costs-of-containers-images/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=whitepapers&utm_content=resources",
        },
        {
          label: { fr: "Read in English", en: "Read in English" },
          href: "https://www.omnivya.fr/whitepapers/hidden-costs-of-containers-images/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=whitepapers&utm_content=resources",
        },
      ],
    },
    {
      id: "hidden-face-iac",
      title: {
        fr: "La face cachée de l’Infrastructure as Code",
        en: "The hidden face of Infrastructure as Code",
      },
      note: {
        fr: "Livre blanc Omnivya : gouverner l’IaC pour accélérer sans transformer chaque apply en incident.",
        en: "Omnivya white paper: govern IaC to accelerate without turning every apply into an incident.",
      },
      links: [
        {
          label: { fr: "Lire en français", en: "Read in French" },
          href: "https://www.omnivya.fr/fr/whitepapers/hidden-face-of-iac/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=whitepapers&utm_content=resources",
        },
        {
          label: { fr: "Read in English", en: "Read in English" },
          href: "https://www.omnivya.fr/whitepapers/hidden-face-of-iac/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=whitepapers&utm_content=resources",
        },
      ],
    },
    {
      id: "stephane-robert-devsecops",
      title: {
        fr: "DevSecOps — Stéphane Robert",
        en: "DevSecOps — Stéphane Robert",
      },
      note: {
        fr: "Référence solide pour patterns et retours de terrain DevSecOps — docs et blog, sans passer par une fiche intermédiaire.",
        en: "Solid reference for DevSecOps patterns and field notes — docs and blog, no intermediate card.",
      },
      links: [
        {
          label: { fr: "Documentation", en: "Documentation" },
          href: "https://blog.stephane-robert.info/docs/?utm_source=etienne_deneuve&utm_medium=links&utm_campaign=etienne_deneuve",
        },
        {
          label: { fr: "Blog", en: "Blog" },
          href: "https://blog.stephane-robert.info/post/?utm_source=etienne_deneuve&utm_medium=links&utm_campaign=etienne_deneuve",
        },
      ],
    },
    {
      id: "techspresso",
      title: {
        fr: "TechSpresso (podcast)",
        en: "TechSpresso (podcast)",
      },
      note: {
        fr: "Podcast matinal tech. J’y suis intervenu comme invité / co-animateur ponctuel — pas un produit Omnivya.",
        en: "Morning tech podcast. I appeared as a guest / occasional co-host — not an Omnivya product.",
      },
      links: [
        {
          label: { fr: "YouTube", en: "YouTube" },
          href: "https://www.youtube.com/@TechSpresso-ug5hl/?utm_source=etienne_deneuve&utm_medium=links&utm_campaign=etienne_deneuve",
        },
        {
          label: { fr: "Apple Podcasts", en: "Apple Podcasts" },
          href: "https://podcasts.apple.com/fr/podcast/techspresso/id1729008749?utm_source=etienne_deneuve&utm_medium=links&utm_campaign=etienne_deneuve",
        },
        {
          label: { fr: "Conférences & médias", en: "Talks & media" },
          href: "/speaking/",
        },
      ],
    },
  ] satisfies ResourceRecommendation[],
} as const;
