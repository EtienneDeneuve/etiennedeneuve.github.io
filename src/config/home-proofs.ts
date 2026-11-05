export type HomeProofLocale = "fr" | "en";

export type HomeProof = {
  value: string;
  label: string;
  body: string;
  href: string;
};

export const homeProofs: Record<HomeProofLocale, readonly HomeProof[]> = {
  fr: [
    {
      value: "≈200 services",
      label: "OpenTelemetry brownfield",
      body: "Un socle commun d’instrumentation déployé sans lancer une réécriture générale de quinze ans de code.",
      href: "/thinking/2026-09-22-opentelemetry-instrumenter-200-services/",
    },
    {
      value: "400 000 bases",
      label: "Cardinalité en production",
      body: "Un cas terrain sur ce qui se passe lorsqu’une dimension utile dans une trace devient une métrique ingérable.",
      href: "/thinking/2026-09-22-opentelemetry-cardinalite-pii-sampling/",
    },
    {
      value: "Lab public",
      label: "Progressive delivery",
      body: "Kind, Cilium, Envoy Gateway et Flagger avec du YAML visible pour montrer qui décide réellement du trafic.",
      href: "/thinking/2026-10-13-flagger-lab-kind-gateway-api/",
    },
  ],
  en: [
    {
      value: "≈200 services",
      label: "Brownfield OpenTelemetry",
      body: "A shared instrumentation baseline rolled out without launching a broad rewrite of fifteen years of code.",
      href: "/en/thinking/2026-09-22-opentelemetry-instrumenter-200-services-en/",
    },
    {
      value: "400,000 databases",
      label: "Production cardinality",
      body: "A field case on what happens when a dimension that is useful in traces becomes an unmanageable metric.",
      href: "/en/thinking/2026-09-22-opentelemetry-cardinalite-pii-sampling-en/",
    },
    {
      value: "Public lab",
      label: "Progressive delivery",
      body: "Kind, Cilium, Envoy Gateway and Flagger with visible YAML to show who actually decides traffic.",
      href: "/en/thinking/2026-10-13-flagger-lab-kind-gateway-api-en/",
    },
  ],
} as const;
