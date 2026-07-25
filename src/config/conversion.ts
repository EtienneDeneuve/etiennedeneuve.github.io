/**
 * Conversion events and CTA wiring.
 * Components should use ConversionCTA + analyticsAttrs, not provider SDKs directly.
 */

export const conversionEvents = [
  "cta_start_here",
  "cta_project_open",
  "cta_contact_email",
  "cta_booking",
  "cta_speaking",
  "cta_rss",
  "cta_github",
] as const;

export type ConversionEvent = (typeof conversionEvents)[number];

export const conversionConfig = {
  events: conversionEvents,
  ctas: {
    primary: {
      label: {
        fr: "Discuter d'un contexte SI complexe",
        en: "Discuss a complex IT context",
      },
      href: {
        fr: "/contact/",
        en: "/en/contact/",
      },
      event: "cta_contact_email" as ConversionEvent,
      intent: "qualification",
    },
    omnivya: {
      label: {
        fr: "Voir Omnivya Expert",
        en: "View Omnivya Expert",
      },
      href: "https://www.omnivya.fr",
      event: "cta_project_open" as ConversionEvent,
      intent: "ecosystem",
    },
    booking: {
      label: {
        fr: "Calendrier Omnivya Expert",
        en: "Omnivya Expert calendar",
      },
      href: "https://www.omnivya.fr",
      event: "cta_booking" as ConversionEvent,
      intent: "booking",
    },
  },
  availability: {
    status: "selective",
    notes: "Missions cloud native, Kubernetes, DevSecOps, FinOps, GreenOps.",
  },
} as const;
