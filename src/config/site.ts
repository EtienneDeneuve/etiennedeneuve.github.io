const currentYear = new Date().getFullYear();
const copyrightStartYear = 2015;

/**
 * Analytics IDs come only from PUBLIC_* env (CI secrets or local `.env`).
 * No hardcoded fallbacks — otherwise production always "looks like defaults"
 * and a missing secret is invisible. Client IDs are public in HTML once set.
 */
const ga4MeasurementId = String(import.meta.env.PUBLIC_GA4_MEASUREMENT_ID ?? "").trim();
const clarityProjectId = String(import.meta.env.PUBLIC_CLARITY_PROJECT_ID ?? "").trim();

export const siteConfig = {
  identity: {
    firstName: "Etienne",
    lastName: "Deneuve",
    name: "Étienne Deneuve",
    brandName: "Etienne Deneuve",
  },
  professionalRole: {
    title: "CTO · Platform Reliability Architect",
    subtitle:
      "Architecture cloud, Kubernetes, observabilité, Platform Engineering et fiabilité des systèmes",
  },
  location: {
    label: "France (remote-first, Europe)",
    countryCode: "FR",
    timezone: "Europe/Paris",
  },
  omnivya: {
    /** Legal / schema operating entity — not the public marketing brand. */
    name: "Omnivya Expert",
    /** Public brand for CTAs, kickers, footer (see brand-architecture). */
    publicName: "Omnivya",
    website: "https://www.omnivya.fr",
    email: "etienne@omnivya.fr",
    /** Qualification entry (prefer over bare homepage). */
    contactPageFr: "https://www.omnivya.fr/fr/contact/",
    contactPageEn: "https://www.omnivya.fr/contact/",
    /** @deprecated use contactPageFr / contactPageEn */
    contactPage: "https://www.omnivya.fr/fr/contact/",
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
  },
  seo: {
    siteUrl: "https://etienne.deneuve.xyz",
    title: "Etienne Deneuve",
    description:
      "CTO and Platform Reliability Architect working on Kubernetes, AKS, cloud architecture, OpenTelemetry, observability, Platform Engineering, SRE, DevSecOps, software supply chain and FinOps.",
    locale: "fr_FR",
    defaultLanguage: "fr",
    defaultOgImage: "https://etienne.deneuve.xyz/assets/og-default.jpg",
    robots: "index,follow,max-image-preview:large",
  },
  languages: {
    default: "fr",
    supported: ["fr", "en"],
  },
  primaryCtas: {
    discussMission: {
      label: "Parler d’un blocage concret",
      href: "https://www.omnivya.fr/fr/contact/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=site&utm_content=primary-cta",
    },
    omnivyaExecution: {
      label: "Contacter Omnivya",
      href: "https://www.omnivya.fr/fr/contact/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=site&utm_content=primary-cta",
    },
  },
  analytics: {
    /** Scripts load only when an ID is present and the visitor accepted analytics cookies. */
    enabled: Boolean(ga4MeasurementId || clarityProjectId),
    provider: ga4MeasurementId ? ("ga4" as const) : ("none" as const),
    plausibleDomain: "",
    ga4MeasurementId,
    clarityProjectId,
  },
  availability: {
    status: "selective",
    message: "Disponible pour missions cadrées sur un objectif et des livrables concrets.",
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
    name: "Étienne Deneuve",
    fullName: "Etienne Deneuve",
    siteName: "Etienne Deneuve",
    tagline: "CTO · Platform Reliability Architect — architecture, plateformes et fiabilité",
    jobTitle: "CTO · Platform Reliability Architect",
    location: "France (remote-first, Europe)",
  },
  site: {
    url: "https://etienne.deneuve.xyz",
    title: "Etienne Deneuve",
    description:
      "CTO and Platform Reliability Architect working on Kubernetes, AKS, cloud architecture, OpenTelemetry, observability, Platform Engineering, SRE, DevSecOps, software supply chain and FinOps.",
    locale: "fr_FR",
    defaultOgImage: "https://etienne.deneuve.xyz/assets/og-default.jpg",
  },
  business: {
    name: "Omnivya Expert",
    email: "etienne@omnivya.fr",
    bookingEmail: "etienne@omnivya.fr",
    bookingUrl: "https://www.omnivya.fr/fr/contact/",
    website: "www.omnivya.fr",
    operatingEntity: "Omnivya Expert",
  },
  contact: {
    personalEmail: "etienne@omnivya.fr",
    businessBookingUrl: "https://www.omnivya.fr/fr/contact/",
    businessEmail: "etienne@omnivya.fr",
  },
} as const;

/** Public Omnivya qualification URL with referral UTMs. */
export function omnivyaContactUrl(lang: "fr" | "en", content = "cta"): string {
  const base = lang === "en" ? siteConfig.omnivya.contactPageEn : siteConfig.omnivya.contactPageFr;
  const url = new URL(base);
  url.searchParams.set("utm_source", "etienne_deneuve");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "site");
  url.searchParams.set("utm_content", content);
  return url.toString();
}

/** Omnivya mission URL with article-level attribution. */
export function omnivyaMissionUrl(
  lang: "fr" | "en",
  missionSlug: string,
  content: string,
  article: string
): string {
  const base =
    lang === "en"
      ? `https://www.omnivya.fr/missions/${missionSlug}/`
      : `https://www.omnivya.fr/fr/missions/${missionSlug}/`;
  const url = new URL(base);
  url.searchParams.set("utm_source", "etienne_deneuve");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "thinking");
  url.searchParams.set("utm_content", content);
  url.searchParams.set("utm_term", article);
  return url.toString();
}

export const getBrandText = {
  primary: () => siteConfig.identity.name,
  siteTitle: (suffix?: string) =>
    suffix ? `${suffix} | ${siteConfig.identity.name}` : siteConfig.identity.name,
  footerCta: () => `Vous voulez travailler avec ${siteConfig.omnivya.publicName} ?`,
  contactCta: () => "Vous voulez travailler avec moi ?",
  operatingEntity: () => siteConfig.omnivya.name,
  publicBrand: () => siteConfig.omnivya.publicName,
} as const;
