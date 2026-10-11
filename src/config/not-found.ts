export const notFoundConfig = {
  fr: {
    title: "Page introuvable",
    description: "Cette page n’existe pas ou a été déplacée.",
    eyebrow: "404",
    heading: "Page introuvable",
    lede: "L’URL demandée n’existe pas ou n’est plus publique.",
    navLabel: "Continuer",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/work/", label: "Accompagnement" },
      { href: "/thinking/", label: "Publications" },
      { href: "/contact/", label: "Contact" },
    ],
  },
} as const;
