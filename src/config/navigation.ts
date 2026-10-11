const primaryFr = [
  { label: "Approche", href: "/#approche" },
  { label: "Interventions", href: "/work/" },
  { label: "Réalisations", href: "/projects/" },
  { label: "Publications", href: "/thinking/" },
];

const primaryEn = [
  { label: "Approach", href: "/en/#approche" },
  { label: "Work", href: "/en/work/" },
  { label: "Projects", href: "/en/projects/" },
  { label: "Publications", href: "/en/thinking/" },
];

/** Explore row in the graphite footer (not duplicated as primary nav). */
const footerExploreFr = [
  { label: "Commencer ici", href: "/start-here/" },
  { label: "Speaking", href: "/speaking/" },
  { label: "À propos", href: "/about/" },
  { label: "Case studies", href: "/work/case-studies/" },
  { label: "Publications", href: "/thinking/" },
  { label: "Réalisations", href: "/projects/" },
  { label: "Interventions", href: "/work/" },
  { label: "Contact", href: "/contact/" },
];

const footerExploreEn = [
  { label: "Start Here", href: "/en/start-here/" },
  { label: "Speaking", href: "/en/speaking/" },
  { label: "About", href: "/en/about/" },
  { label: "Case studies", href: "/en/work/case-studies/" },
  { label: "Publications", href: "/en/thinking/" },
  { label: "Projects", href: "/en/projects/" },
  { label: "Work", href: "/en/work/" },
  { label: "Contact", href: "/en/contact/" },
];

export const navigationConfig = {
  primary: {
    fr: primaryFr,
    en: primaryEn,
  },
  /** @deprecated Prefer footerExplore — kept for compat with any leftover imports. */
  secondary: {
    fr: footerExploreFr,
    en: footerExploreEn,
  },
  /** Explore links — middle row of the graphite footer. */
  footerExplore: {
    fr: footerExploreFr,
    en: footerExploreEn,
  },
  /** @deprecated Use footerExplore. */
  footerCompact: {
    fr: footerExploreFr,
    en: footerExploreEn,
  },
  legal: {
    fr: [
      { label: "Mentions utiles", href: "/about/" },
      { label: "Media Kit", href: "/media-kit.html" },
    ],
    en: [
      { label: "Legal notes", href: "/en/about/" },
      { label: "Media Kit", href: "/media-kit.html" },
    ],
  },
  cta: {
    fr: { label: "Écrire", href: "/contact/" },
    en: { label: "Write", href: "/en/contact/" },
  },
  rss: "/rss.xml",
} as const;

export type SupportedNavLocale = keyof typeof navigationConfig.primary;
