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
        fr: "Contacter Omnivya",
        en: "Contact Omnivya",
      },
      href: {
        fr: "https://www.omnivya.fr/fr/contact/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=site&utm_content=conversion-omnivya",
        en: "https://www.omnivya.fr/contact/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=site&utm_content=conversion-omnivya",
      },
      event: "cta_booking" as ConversionEvent,
      intent: "qualification",
    },
    booking: {
      label: {
        fr: "Contacter Omnivya",
        en: "Contact Omnivya",
      },
      href: {
        fr: "https://www.omnivya.fr/fr/contact/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=site&utm_content=conversion-contact",
        en: "https://www.omnivya.fr/contact/?utm_source=etienne_deneuve&utm_medium=referral&utm_campaign=site&utm_content=conversion-contact",
      },
      event: "cta_booking" as ConversionEvent,
      intent: "booking",
    },
  },
  availability: {
    status: "selective",
    notes: "Missions cloud native, Kubernetes, DevSecOps, FinOps, GreenOps.",
  },
} as const;
