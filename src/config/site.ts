const currentYear = new Date().getFullYear();
const copyrightStartYear = 2015;

export const siteConfig = {
  identity: {
    firstName: "Etienne",
    lastName: "Deneuve",
    name: "Etienne Deneuve",
    brandName: "Etienne Deneuve",
  },
  professionalRole: {
    title: "Platform Reliability Architect",
    subtitle: "Cloud Native, Kubernetes, DevSecOps, FinOps, GreenOps, Platform Engineering",
  },
  location: {
    label: "France (remote-first, Europe)",
    countryCode: "FR",
    timezone: "Europe/Paris",
  },
  omnivya: {
    name: "Omnivya",
    website: "https://www.omnivya.fr",
    email: "etienne@omnivya.fr",
    contactPage: "https://www.omnivya.fr",
  },
  social: {
    x: "https://twitter.com/EtienneDinfo",
    twitter: "https://twitter.com/EtienneDinfo",
    github: "https://github.com/EtienneDeneuve",
    linkedin: "https://linkedin.com/in/EtienneDeneuve",
    youtube: "https://www.youtube.com/@EtienneDeneuve/",
  },
  ecosystemLinks: {
    omnivya: "https://www.omnivya.fr",
    sanad: "https://sanad.cloud",
    myDare: "https://my-dare.com",
  },
  seo: {
    siteUrl: "https://etienne.deneuve.xyz",
    title: "Etienne Deneuve",
    description:
      "Architecture notes, platform decisions and field write-ups on Kubernetes, cloud platforms, systems risk, and software delivery.",
    locale: "fr_FR",
    defaultLanguage: "fr",
    defaultOgImage: "https://etienne.deneuve.xyz/assets/portrait.jpg",
    robots: "index,follow,max-image-preview:large",
  },
  languages: {
    default: "fr",
    supported: ["fr", "en"],
  },
  primaryCtas: {
    discussMission: {
      label: "Discuter d'un contexte SI complexe",
      href: "mailto:etienne@omnivya.fr?subject=Discussion%20mission%20plateforme",
    },
    omnivyaExecution: {
      label: "Voir l'execution Omnivya",
      href: "https://www.omnivya.fr",
    },
  },
  analytics: {
    enabled: false,
    provider: "none",
    plausibleDomain: "",
    ga4MeasurementId: "",
  },
  availability: {
    status: "selective",
    message: "Disponible pour missions a forte complexite technique et organisationnelle.",
  },
  copyright: {
    startYear: copyrightStartYear,
    currentYear,
    notice:
      currentYear === copyrightStartYear
        ? `© ${currentYear} Etienne Deneuve`
        : `© ${copyrightStartYear}-${currentYear} Etienne Deneuve`,
  },

  // Legacy aliases kept for compatibility with existing components/pages.
  author: {
    name: "Etienne Deneuve",
    fullName: "Etienne Deneuve",
    siteName: "Etienne Deneuve",
    tagline:
      "Platform Reliability Architect - Cloud Native, Kubernetes, DevSecOps, FinOps, GreenOps",
    jobTitle: "Platform Reliability Architect",
    location: "France (remote-first, Europe)",
  },
  site: {
    url: "https://etienne.deneuve.xyz",
    title: "Etienne Deneuve",
    description:
      "Architecture notes, platform decisions and field write-ups on Kubernetes, cloud platforms, systems risk, and software delivery.",
    locale: "fr_FR",
    defaultOgImage: "https://etienne.deneuve.xyz/assets/portrait.jpg",
  },
  business: {
    name: "Omnivya",
    email: "etienne@omnivya.fr",
    bookingEmail: "etienne@omnivya.fr",
    bookingUrl: "https://www.omnivya.fr",
    website: "www.omnivya.fr",
    operatingEntity: "Omnivya",
  },
  contact: {
    personalEmail: "etienne@omnivya.fr",
    businessBookingUrl: "https://www.omnivya.fr",
    businessEmail: "etienne@omnivya.fr",
  },
} as const;

export const getBrandText = {
  primary: () => siteConfig.identity.name,
  siteTitle: (suffix?: string) =>
    suffix ? `${suffix} | ${siteConfig.identity.name}` : siteConfig.identity.name,
  footerCta: () => `Vous voulez travailler avec ${siteConfig.omnivya.name} ?`,
  contactCta: () => "Vous voulez travailler avec moi ?",
  operatingEntity: () => siteConfig.omnivya.name,
} as const;
