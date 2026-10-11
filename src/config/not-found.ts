export const notFoundConfig = {
  fr: {
    title: "Page introuvable",
    description:
      "Cette page n’existe pas ou a été déplacée. Explorez Start here, Thinking ou Projects.",
    eyebrow: "404",
    heading: "Page introuvable",
    lede: "L’URL demandée n’existe pas, a été déplacée, ou n’est plus publique. Les anciennes URLs blog / case studies redirigent vers Thinking et Work.",
    navLabel: "Pages utiles",
    goTo: "Aller vers",
    ctaPrimary: "Start here",
    ctaSecondary: "Thinking",
    ctaContact: "Contact",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/start-here/", label: "Start here" },
      { href: "/thinking/", label: "Thinking" },
      { href: "/projects/", label: "Projects" },
      { href: "/work/", label: "Work" },
      { href: "/speaking/", label: "Speaking" },
      { href: "/about/", label: "About" },
      { href: "/contact/", label: "Contact" },
    ],
  },
} as const;
