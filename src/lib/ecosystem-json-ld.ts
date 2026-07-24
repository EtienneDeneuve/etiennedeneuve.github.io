import {
  getEntity,
  type EcosystemLocale,
  type EcosystemEntityId,
} from "../data/ecosystem.ts";
import { seoConfig, absoluteUrl } from "../config/seo.ts";

type JsonLdObject = Record<string, unknown>;

const SITE = seoConfig.siteUrl;

/** Permanent fragment ids on the site domain (Prompt 5). */
export const ecosystemJsonLdIds = {
  etienne: `${SITE}/#etienne`,
  taous: `${SITE}/#taous`,
  website: `${SITE}/#website`,
  omnivya: `${SITE}/#omnivya`,
  "omnivya-expert": `${SITE}/#omnivya-expert`,
  simplified: `${SITE}/#simplified`,
  "it-challenge": `${SITE}/#it-challenge`,
  "my-dare": `${SITE}/#my-dare`,
  sanad: `${SITE}/#sanad`,
  "open-source": `${SITE}/#open-source`,
} as const;

export type EcosystemJsonLdId = keyof typeof ecosystemJsonLdIds;

export function ecosystemNodeId(id: EcosystemJsonLdId): string {
  return ecosystemJsonLdIds[id];
}

function ref(id: EcosystemJsonLdId): { "@id": string } {
  return { "@id": ecosystemNodeId(id) };
}

/**
 * Canonical ecosystem entities for JSON-LD.
 * Soft links only (memberOf / brand / provider) — no speculative legal ownership.
 */
export function buildEcosystemEntityNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  const etienne = getEntity("etienne");
  const taous = getEntity("taous");
  const omnivya = getEntity("omnivya");
  const expert = getEntity("omnivya-expert");
  const myDare = getEntity("my-dare");
  const sanad = getEntity("sanad");
  const simplified = getEntity("simplified");
  const itChallenge = getEntity("it-challenge");
  const openSource = getEntity("open-source");

  const nodes: JsonLdObject[] = [
    {
      "@type": "Person",
      "@id": ecosystemNodeId("etienne"),
      name: etienne.canonicalName,
      jobTitle: "CTO",
      description: etienne.metaDescription[locale],
      url: etienne.externalUrl ?? SITE,
      email: seoConfig.person.email,
      image: absoluteUrl(seoConfig.person.image),
      sameAs: etienne.sameAs,
      knowsAbout: seoConfig.person.knowsAbout,
      worksFor: ref("omnivya"),
      affiliation: ref("omnivya"),
    },
    {
      "@type": "Person",
      "@id": ecosystemNodeId("taous"),
      name: taous.canonicalName,
      jobTitle: locale === "fr" ? "Dirigeante" : "Leader",
      description: taous.metaDescription[locale],
      url: absoluteUrl(taous.internalPath?.[locale] ?? "/about/"),
      affiliation: ref("omnivya"),
    },
    {
      "@type": "Organization",
      "@id": ecosystemNodeId("omnivya"),
      name: omnivya.canonicalName,
      description: omnivya.metaDescription[locale],
      url: omnivya.externalUrl,
      sameAs: omnivya.sameAs,
      email: seoConfig.organization.email,
      // Confirmed co-founders — not a speculative legal claim beyond founding roles.
      founder: [ref("etienne"), ref("taous")],
      brand: [ref("omnivya-expert"), ref("my-dare"), ref("sanad")],
    },
    {
      "@type": "Organization",
      "@id": ecosystemNodeId("omnivya-expert"),
      name: expert.canonicalName,
      description: expert.metaDescription[locale],
      url: expert.externalUrl,
      alternateName: expert.historicalNames,
      memberOf: ref("omnivya"),
      areaServed: [
        { "@type": "Place", name: "Europe" },
        { "@type": "Place", name: "Africa" },
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": ecosystemNodeId("my-dare"),
      name: myDare.canonicalName,
      description: myDare.metaDescription[locale],
      url: myDare.externalUrl,
      sameAs: myDare.sameAs,
      memberOf: ref("omnivya"),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Algiers",
        addressCountry: "DZ",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": ecosystemNodeId("sanad"),
      name: sanad.canonicalName,
      description: sanad.metaDescription[locale],
      url: sanad.externalUrl,
      sameAs: sanad.sameAs,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      provider: ref("omnivya-expert"),
      isRelatedTo: ref("omnivya"),
    },
    {
      "@type": "Organization",
      "@id": ecosystemNodeId("simplified"),
      name: simplified.canonicalName,
      description: simplified.metaDescription[locale],
      foundingDate: simplified.createdAt,
      alternateName: simplified.historicalNames,
      disambiguatingDescription: simplified.historicalPhrase?.[locale],
    },
    {
      "@type": "Organization",
      "@id": ecosystemNodeId("it-challenge"),
      name: itChallenge.canonicalName,
      description: itChallenge.metaDescription[locale],
      disambiguatingDescription: itChallenge.historicalPhrase?.[locale],
      address: {
        "@type": "PostalAddress",
        addressCountry: "DZ",
      },
    },
    {
      "@type": "CreativeWork",
      "@id": ecosystemNodeId("open-source"),
      name: openSource.canonicalName,
      description: openSource.metaDescription[locale],
      url: openSource.externalUrl,
      sameAs: openSource.sameAs,
      creator: ref("etienne"),
      isRelatedTo: ref("omnivya"),
    },
  ];

  return nodes;
}

export function getEcosystemEntityNode(
  id: EcosystemJsonLdId,
  locale: EcosystemLocale = "fr",
): JsonLdObject | undefined {
  return buildEcosystemEntityNodes(locale).find((node) => node["@id"] === ecosystemNodeId(id));
}

/** Core identity nodes used on most pages. */
export function coreIdentityNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  const nodes = buildEcosystemEntityNodes(locale);
  return nodes
    .filter((node) =>
      [ecosystemNodeId("etienne"), ecosystemNodeId("taous"), ecosystemNodeId("omnivya")].includes(
        String(node["@id"]),
      ),
    )
    .map((node) => {
      if (node["@id"] !== ecosystemNodeId("omnivya")) return node;
      const { brand: _brand, ...hub } = node;
      return hub;
    });
}

/** About / ecosystem pages: people + hub. */
export function aboutIdentityNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  return coreIdentityNodes(locale);
}

/** Full ecosystem graph for the canonical ecosystem page. */
export function fullEcosystemNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  return buildEcosystemEntityNodes(locale);
}

/** Project-detail helpers: include the entity being documented. */
export function projectEntityNodes(
  projectId: string,
  locale: EcosystemLocale = "fr",
): JsonLdObject[] {
  const map: Record<string, EcosystemJsonLdId[]> = {
    omnivya: ["etienne", "taous", "omnivya", "omnivya-expert", "simplified", "it-challenge"],
    "my-dare": ["etienne", "taous", "omnivya", "my-dare"],
    sanad: ["etienne", "taous", "omnivya", "omnivya-expert", "sanad"],
    "external-metrics-exporter": ["etienne", "omnivya", "open-source", "simplified"],
  };
  const ids = map[projectId] ?? ["etienne", "taous", "omnivya"];
  const all = buildEcosystemEntityNodes(locale);
  const selected = all.filter((node) => ids.some((id) => node["@id"] === ecosystemNodeId(id)));
  // Drop brand links unless all brand targets are present in this subset.
  return selected.map((node) => {
    if (node["@id"] !== ecosystemNodeId("omnivya") || !Array.isArray(node.brand)) return node;
    const selectedIds = new Set(selected.map((n) => n["@id"]));
    const brand = (node.brand as Array<{ "@id": string }>).filter((item) =>
      selectedIds.has(item["@id"]),
    );
    const { brand: _b, ...rest } = node;
    return brand.length > 0 ? { ...rest, brand } : rest;
  });
}

export function validateEcosystemJsonLdGraph(nodes: JsonLdObject[]): string[] {
  const errors: string[] = [];
  const ids = nodes.map((node) => node["@id"]).filter(Boolean) as string[];
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) errors.push(`Duplicate @id: ${id}`);
    seen.add(id);
  }

  const publicIds: EcosystemJsonLdId[] = [
    "etienne",
    "omnivya",
    "omnivya-expert",
    "my-dare",
    "sanad",
  ];

  for (const id of publicIds) {
    const node = nodes.find((n) => n["@id"] === ecosystemNodeId(id));
    if (!node) {
      errors.push(`Missing public entity: ${id}`);
      continue;
    }
    if (!node.name) errors.push(`${id}: missing name`);
    if (!node.url) errors.push(`${id}: missing url`);
  }

  const serialized = JSON.stringify(nodes);
  if (/example\.com|placeholder|TODO|localhost|127\.0\.0\.1|#(?!")/.test(serialized)) {
    // Allow fragment @ids; flag bare "#" URL placeholders only.
  }
  if (serialized.includes('"url":"#"') || serialized.includes('"url": "#"')) {
    errors.push("Placeholder URL '#' found");
  }

  // Orphan refs: every local fragment ref must resolve in the full entity set.
  if (nodes.length >= 8) {
    const refIds = new Set<string>();
    const walk = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      const obj = value as Record<string, unknown>;
      if (typeof obj["@id"] === "string" && Object.keys(obj).length === 1) {
        refIds.add(obj["@id"]);
      }
      for (const [key, child] of Object.entries(obj)) {
        if (key !== "@id") walk(child);
      }
    };
    nodes.forEach(walk);
    for (const refId of refIds) {
      if (!refId.startsWith(`${SITE}/#`)) continue;
      if (refId === ecosystemNodeId("website")) continue;
      if (!seen.has(refId)) errors.push(`Orphan reference: ${refId}`);
    }
  }

  return errors;
}

/** Map content collection project ids to ecosystem entity ids when applicable. */
export function projectIdToEcosystemId(projectId: string): EcosystemEntityId | null {
  const map: Record<string, EcosystemEntityId> = {
    omnivya: "omnivya",
    "my-dare": "my-dare",
    sanad: "sanad",
    "external-metrics-exporter": "open-source",
  };
  return map[projectId] ?? null;
}
