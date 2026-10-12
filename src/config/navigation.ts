const primaryFr = [
  { label: "Approche", href: "/#approche" },
  { label: "Accompagnement", href: "/work/" },
  { label: "Réalisations", href: "/projects/" },
  { label: "Publications", href: "/thinking/" },
];

const primaryEn = [
  { label: "Approach", href: "/en/#approche" },
  { label: "Advisory", href: "/en/work/" },
  { label: "Projects", href: "/en/projects/" },
  { label: "Publications", href: "/en/thinking/" },
];

/**
 * Footer explore — no Start Here (folded into home), no empty case studies.
 * Resources stay footer-only (compact library).
 */
const footerExploreFr = [
  { label: "À propos", href: "/about/" },
  { label: "Accompagnement", href: "/work/" },
  { label: "Réalisations", href: "/projects/" },
  { label: "Conférences & médias", href: "/speaking/" },
  { label: "Publications", href: "/thinking/" },
  { label: "Ressources", href: "/resources/" },
  { label: "Contact", href: "/contact/" },
];

const footerExploreEn = [
  { label: "About", href: "/en/about/" },
  { label: "Advisory", href: "/en/work/" },
  { label: "Projects", href: "/en/projects/" },
  { label: "Talks & media", href: "/en/speaking/" },
  { label: "Publications", href: "/en/thinking/" },
  { label: "Resources", href: "/en/resources/" },
  { label: "Contact", href: "/en/contact/" },
];

export const navigationConfig = {
  primary: {
    fr: primaryFr,
    en: primaryEn,
  },
  /** @deprecated Prefer footerExplore */
  secondary: {
    fr: footerExploreFr,
    en: footerExploreEn,
  },
  footerExplore: {
    fr: footerExploreFr,
    en: footerExploreEn,
  },
  /** @deprecated Prefer footerExplore */
  footerCompact: {
    fr: footerExploreFr,
    en: footerExploreEn,
  },
  legal: {
    fr: [{ label: "Media Kit", href: "/media-kit.html" }],
    en: [{ label: "Media Kit", href: "/media-kit.html" }],
  },
  cta: {
    fr: { label: "Nous contacter", href: "/contact/" },
    en: { label: "Contact us", href: "/en/contact/" },
  },
  rss: "/rss.xml",
} as const;

export type SupportedNavLocale = keyof typeof navigationConfig.primary;
