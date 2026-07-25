import { getEntity, type EcosystemLocale, type EcosystemEntityId } from "../data/ecosystem.ts";
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
 * Public graph: Etienne + Omnivya Expert + Simplifi’ED history + open source.
 * Taous / Sanad / My Dare / IT Challenge are not emitted on the public graph.
 */
export function buildEcosystemEntityNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  const etienne = getEntity("etienne");
  const omnivya = getEntity("omnivya");
  const expert = getEntity("omnivya-expert");
  const simplified = getEntity("simplified");
  const openSource = getEntity("open-source");

  const nodes: JsonLdObject[] = [
    {
      "@type": "Person",
      "@id": ecosystemNodeId("etienne"),
      name: etienne.canonicalName,
      jobTitle: seoConfig.person.jobTitle,
      description: seoConfig.defaultDescription,
      url: etienne.externalUrl ?? SITE,
      email: seoConfig.person.email,
      image: absoluteUrl(seoConfig.person.image),
      sameAs: etienne.sameAs,
      knowsAbout: seoConfig.person.knowsAbout,
      worksFor: ref("omnivya-expert"),
      affiliation: ref("omnivya-expert"),
    },
    {
      "@type": "Organization",
      "@id": ecosystemNodeId("omnivya"),
      name: expert.canonicalName,
      description:
        locale === "en"
          ? "Omnivya Expert carries consulting, engineering and structured delivery."
          : "Omnivya Expert porte le conseil, l’ingénierie et la delivery structurée.",
      url: expert.externalUrl ?? omnivya.externalUrl,
      sameAs: expert.externalUrl ? [expert.externalUrl] : omnivya.sameAs,
      email: seoConfig.organization.email,
      founder: [ref("etienne")],
      brand: [ref("omnivya-expert")],
    },
    {
      "@type": "Organization",
      "@id": ecosystemNodeId("omnivya-expert"),
      name: expert.canonicalName,
      description:
        locale === "en"
          ? "Consulting, engineering and structured delivery under Omnivya Expert."
          : "Conseil, ingénierie et delivery structurée sous Omnivya Expert.",
      url: expert.externalUrl,
      alternateName: ["Simplifi’ED"],
      memberOf: ref("omnivya"),
    },
    {
      "@type": "Organization",
      "@id": ecosystemNodeId("simplified"),
      name: simplified.canonicalName,
      description:
        locale === "en"
          ? "Historical name of the consulting and engineering activity founded in 2020."
          : "Nom historique de l’activité de conseil et d’ingénierie fondée en 2020.",
      foundingDate: simplified.createdAt,
      alternateName: simplified.historicalNames,
      disambiguatingDescription:
        locale === "en"
          ? "Founded 2020; now a historical name, services under Omnivya Expert."
          : "Créée en 2020 ; aujourd’hui nom historique, services sous Omnivya Expert.",
    },
    {
      "@type": "CreativeWork",
      "@id": ecosystemNodeId("open-source"),
      name: openSource.canonicalName,
      description: openSource.metaDescription[locale],
      url: openSource.externalUrl,
      sameAs: openSource.sameAs,
      creator: ref("etienne"),
      isRelatedTo: ref("omnivya-expert"),
    },
  ];

  return nodes;
}

export function getEcosystemEntityNode(
  id: EcosystemJsonLdId,
  locale: EcosystemLocale = "fr"
): JsonLdObject | undefined {
  return buildEcosystemEntityNodes(locale).find((node) => node["@id"] === ecosystemNodeId(id));
}

/** Core identity nodes used on most pages — Etienne + Omnivya Expert only. */
export function coreIdentityNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  const nodes = buildEcosystemEntityNodes(locale);
  return nodes.filter((node) =>
    [ecosystemNodeId("etienne"), ecosystemNodeId("omnivya-expert")].includes(String(node["@id"]))
  );
}

/** About identity: same public core (no group cartography). */
export function aboutIdentityNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  return coreIdentityNodes(locale);
}

/** Full public entity set (no Sanad / My Dare / IT Challenge / Taous). */
export function fullEcosystemNodes(locale: EcosystemLocale = "fr"): JsonLdObject[] {
  return buildEcosystemEntityNodes(locale);
}

/** Project-detail helpers: include the entity being documented. */
export function projectEntityNodes(
  projectId: string,
  locale: EcosystemLocale = "fr"
): JsonLdObject[] {
  const map: Record<string, EcosystemJsonLdId[]> = {
    omnivya: ["etienne", "omnivya", "omnivya-expert", "simplified"],
    "external-metrics-exporter": ["etienne", "omnivya-expert", "open-source", "simplified"],
  };
  const ids = map[projectId] ?? ["etienne", "omnivya-expert"];
  const all = buildEcosystemEntityNodes(locale);
  const selected = all.filter((node) => ids.some((id) => node["@id"] === ecosystemNodeId(id)));
  return selected.map((node) => {
    if (node["@id"] !== ecosystemNodeId("omnivya") || !Array.isArray(node.brand)) return node;
    const selectedIds = new Set(selected.map((n) => n["@id"]));
    const brand = (node.brand as Array<{ "@id": string }>).filter((item) =>
      selectedIds.has(item["@id"])
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

  const publicIds: EcosystemJsonLdId[] = ["etienne", "omnivya", "omnivya-expert"];

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
  if (nodes.length >= 5) {
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
    omnivya: "omnivya-expert",
    "external-metrics-exporter": "open-source",
  };
  return map[projectId] ?? null;
}
