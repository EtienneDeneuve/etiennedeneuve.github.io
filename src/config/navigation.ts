const primaryFr = [
  { label: "Home", href: "/" },
  { label: "Start Here", href: "/start-here/" },
  { label: "Thinking", href: "/thinking/" },
  { label: "Work", href: "/work/" },
  { label: "Projects", href: "/projects/" },
  { label: "Speaking", href: "/speaking/" },
  { label: "About", href: "/about/" },
];

const primaryEn = [
  { label: "Home", href: "/en/" },
  { label: "Start Here", href: "/en/start-here/" },
  { label: "Thinking", href: "/en/thinking/" },
  { label: "Work", href: "/en/work/" },
  { label: "Projects", href: "/en/projects/" },
  { label: "Speaking", href: "/en/speaking/" },
  { label: "About", href: "/en/about/" },
];

export const navigationConfig = {
  primary: {
    fr: primaryFr,
    en: primaryEn,
  },
  secondary: {
    fr: [
      { label: "Contact", href: "/contact/" },
      { label: "Case Studies", href: "/work/case-studies/" },
      { label: "RSS", href: "/rss.xml" },
    ],
    en: [
      { label: "Contact", href: "/en/contact/" },
      { label: "Case Studies", href: "/en/work/case-studies/" },
      { label: "RSS", href: "/rss.xml" },
    ],
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
    fr: { label: "Parler d’un système complexe", href: "/contact/" },
    en: { label: "Discuss a complex system", href: "/en/contact/" },
  },
  rss: "/rss.xml",
} as const;

export type SupportedNavLocale = keyof typeof navigationConfig.primary;
