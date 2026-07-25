import { seoConfig, absoluteUrl, type SeoLang } from "../config/seo.ts";
import { ecosystemNodeId } from "./ecosystem-json-ld.ts";

export type JsonLdObject = Record<string, unknown>;

const CONTEXT = "https://schema.org";

function withContext(node: JsonLdObject): JsonLdObject {
  return { "@context": CONTEXT, ...node };
}

/**
 * Flatten nested @graph payloads and drop nulls before emitting a single graph.
 */
export function buildJsonLdGraph(items: Array<JsonLdObject | null | undefined>): JsonLdObject {
  const graph: JsonLdObject[] = [];
  for (const item of items) {
    if (!item) continue;
    if (Array.isArray(item["@graph"])) {
      for (const nested of item["@graph"] as JsonLdObject[]) {
        if (nested) graph.push(nested);
      }
      continue;
    }
    const { ["@context"]: _ctx, ...rest } = item;
    graph.push(Object.keys(rest).length ? rest : item);
  }

  // Deduplicate by @id when present (last write wins for overrides).
  const byId = new Map<string, JsonLdObject>();
  const withoutId: JsonLdObject[] = [];
  for (const node of graph) {
    const id = typeof node["@id"] === "string" ? node["@id"] : null;
    if (id) byId.set(id, node);
    else withoutId.push(node);
  }
  const deduped = [...byId.values(), ...withoutId];

  if (deduped.length === 0) {
    return withContext({ "@type": "WebPage" });
  }
  if (deduped.length === 1) {
    return withContext(deduped[0]);
  }
  return {
    "@context": CONTEXT,
    "@graph": deduped,
  };
}

export function personJsonLd(overrides: JsonLdObject = {}): JsonLdObject {
  return {
    "@type": "Person",
    "@id": ecosystemNodeId("etienne"),
    name: seoConfig.person.name,
    jobTitle: seoConfig.person.jobTitle,
    email: seoConfig.person.email,
    url: seoConfig.person.url,
    image: absoluteUrl(seoConfig.person.image),
    sameAs: seoConfig.person.sameAs,
    knowsAbout: seoConfig.person.knowsAbout,
    worksFor: { "@id": ecosystemNodeId("omnivya") },
    ...overrides,
  };
}

/** Organization node (#omnivya) — display name comes from siteConfig (Omnivya Expert). */
export function organizationJsonLd(overrides: JsonLdObject = {}): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": ecosystemNodeId("omnivya"),
    name: seoConfig.organization.name,
    url: seoConfig.organization.url,
    email: seoConfig.organization.email,
    founder: [{ "@id": ecosystemNodeId("etienne") }, { "@id": ecosystemNodeId("taous") }],
    ...overrides,
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": ecosystemNodeId("website"),
    url: seoConfig.siteUrl,
    name: seoConfig.siteName,
    description: seoConfig.defaultDescription,
    inLanguage: ["fr", "en"],
    publisher: { "@id": ecosystemNodeId("etienne") },
  };
}

export function profilePageJsonLd(path = "/about/"): JsonLdObject {
  return {
    "@type": "ProfilePage",
    "@id": absoluteUrl(path),
    url: absoluteUrl(path),
    name: `${seoConfig.person.name} — About`,
    mainEntity: { "@id": ecosystemNodeId("etienne") },
    isPartOf: { "@id": ecosystemNodeId("website") },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  lang?: SeoLang;
}): JsonLdObject {
  return {
    "@type": "CollectionPage",
    "@id": absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    inLanguage: input.lang ?? "fr",
    isPartOf: { "@id": ecosystemNodeId("website") },
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  lang: SeoLang;
  datePublished: Date | string;
  dateModified?: Date | string;
  image?: string;
  draft?: boolean;
}): JsonLdObject | null {
  if (input.draft) return null;
  const published =
    input.datePublished instanceof Date
      ? input.datePublished.toISOString()
      : new Date(input.datePublished).toISOString();
  const modifiedRaw = input.dateModified ?? input.datePublished;
  const modified =
    modifiedRaw instanceof Date ? modifiedRaw.toISOString() : new Date(modifiedRaw).toISOString();

  return {
    "@type": "Article",
    "@id": absoluteUrl(input.path),
    headline: input.title,
    description: input.description,
    inLanguage: input.lang,
    datePublished: published,
    dateModified: modified,
    image: input.image ? absoluteUrl(input.image) : seoConfig.defaultImage,
    author: { "@id": ecosystemNodeId("etienne") },
    publisher: { "@id": ecosystemNodeId("etienne") },
    mainEntityOfPage: absoluteUrl(input.path),
    isPartOf: { "@id": ecosystemNodeId("website") },
  };
}

/**
 * Open-source repositories — never Product.
 */
export function softwareSourceCodeJsonLd(input: {
  name: string;
  description: string;
  codeRepository: string;
  programmingLanguage?: string | null;
  license?: string | null;
  url: string;
}): JsonLdObject {
  return {
    "@type": "SoftwareSourceCode",
    name: input.name,
    description: input.description,
    codeRepository: input.codeRepository,
    url: absoluteUrl(input.url),
    programmingLanguage: input.programmingLanguage ?? undefined,
    license: input.license ?? undefined,
    author: { "@id": ecosystemNodeId("etienne") },
    isRelatedTo: { "@id": ecosystemNodeId("open-source") },
  };
}

/**
 * Project page as WebPage / CreativeWork — not a commercial Product.
 */
export function projectPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  lang?: SeoLang;
  relatedToOmnivya?: boolean;
  aboutId?: string;
  repository?: string;
}): JsonLdObject {
  const node: JsonLdObject = {
    "@type": "WebPage",
    "@id": absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    inLanguage: input.lang ?? "fr",
    author: { "@id": ecosystemNodeId("etienne") },
    isPartOf: { "@id": ecosystemNodeId("website") },
  };
  if (input.aboutId) {
    node.about = { "@id": input.aboutId };
  } else if (input.relatedToOmnivya) {
    node.about = { "@id": ecosystemNodeId("omnivya") };
  }
  if (input.repository) {
    node.significantLink = input.repository;
  }
  return node;
}

/**
 * Only for documented public appearances.
 */
export function eventJsonLd(input: {
  name: string;
  description?: string;
  startDate: Date | string;
  location?: string;
  url?: string;
  eventAttendanceMode?:
    | "OfflineEventAttendanceMode"
    | "OnlineEventAttendanceMode"
    | "MixedEventAttendanceMode";
}): JsonLdObject {
  const start =
    input.startDate instanceof Date
      ? input.startDate.toISOString()
      : new Date(input.startDate).toISOString();
  return {
    "@type": "Event",
    name: input.name,
    description: input.description,
    startDate: start,
    eventAttendanceMode: input.eventAttendanceMode
      ? `https://schema.org/${input.eventAttendanceMode}`
      : undefined,
    location: input.location
      ? {
          "@type": "Place",
          name: input.location,
        }
      : undefined,
    url: input.url,
    performer: { "@id": ecosystemNodeId("etienne") },
  };
}

/**
 * Only when a real engagement mode is described (Work intervention modes).
 */
export function serviceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}): JsonLdObject {
  return {
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    serviceType: input.serviceType,
    provider: { "@id": ecosystemNodeId("omnivya-expert") },
  };
}

export function caseStudyJsonLd(entry: {
  data: {
    title: string;
    summary: string;
    pubDate: Date;
    draft?: boolean;
  };
  slug: string;
}): JsonLdObject | null {
  if (entry.data.draft) return null;
  return articleJsonLd({
    title: entry.data.title,
    description: entry.data.summary,
    path: `/work/case-studies/${entry.slug}/`,
    lang: "fr",
    datePublished: entry.data.pubDate,
  });
}
