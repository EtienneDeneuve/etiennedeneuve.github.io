/**
 * Site Configuration - Single Source of Truth
 * 
 * This file contains all brand, site, and contact information.
 * Import this config in components/pages instead of hardcoding values.
 */

export const siteConfig = {
  // Primary Brand (Personal)
  author: {
    name: "Etienne Deneuve",
    fullName: "Etienne Deneuve",
    siteName: "Etienne Deneuve - Personal Blog",
    tagline: "Cloud Infrastructure & Platform Strategy Advisor Expert Kubernetes & Azure - DevSecOps - FinOps - Platform engineering",
    jobTitle: "Cloud Infrastructure & Platform Strategy Advisor",
    location: "Clamart, Île-de-France, France",
  },

  // Site Information
  site: {
    url: "https://etienne.deneuve.xyz",
    title: "Etienne Deneuve: Personal Site",
    description: "Cloud Infrastructure & Platform Strategy Advisor. Expert en Kubernetes, Azure, DevSecOps, FinOps et Platform Engineering chez Omnivya.",
    locale: "fr_FR",
    defaultOgImage: "https://etienne.deneuve.xyz/public/assets/portrait.jpg",
  },

  // Business Entity (Secondary/Operating Entity)
  business: {
    name: "Omnivya",
    email: "etienne@omnivya.fr",
    bookingEmail: "SimplifiED1@simplified.fr",
    bookingUrl: "https://outlook.office365.com/owa/calendar/SimplifiED1@simplified.fr/bookings/",
    website: "www.omnivya.fr",
    // Used in footer/CTAs when mentioning business inquiries
    operatingEntity: "Omnivya",
  },

  // Social Links
  social: {
    twitter: "https://twitter.com/EtienneDinfo",
    github: "https://github.com/EtienneDeneuve",
    linkedin: "https://linkedin.com/in/EtienneDeneuve",
    youtube: "https://www.youtube.com/@EtienneDeneuve/",
  },

  // Contact
  contact: {
    // For personal inquiries
    personalEmail: "etienne@omnivya.fr",
    // For business/professional inquiries (booking)
    businessBookingUrl: "https://outlook.office365.com/owa/calendar/SimplifiED1@simplified.fr/bookings/",
    businessEmail: "SimplifiED1@simplified.fr",
  },
} as const;

// Helper functions for common brand strings
export const getBrandText = {
  // Primary brand name
  primary: () => siteConfig.author.name,
  
  // Site title with optional suffix
  siteTitle: (suffix?: string) => 
    suffix ? `${suffix} | ${siteConfig.author.name}` : siteConfig.author.name,
  
  // Footer CTA text (mentions business entity)
  footerCta: () => `Vous voulez travailler avec ${siteConfig.business.name} ?`,
  
  // Contact CTA text (personal)
  contactCta: () => "Vous voulez travailler avec moi ?",
  
  // Operating entity mention (for business contexts)
  operatingEntity: () => siteConfig.business.operatingEntity,
} as const;
