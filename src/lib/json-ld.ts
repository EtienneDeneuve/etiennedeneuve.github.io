import { seoConfig, absoluteUrl, type SeoLang } from "../config/seo.ts";

export type JsonLdObject = Record<string, unknown>;

const CONTEXT = "https://schema.org";

function withContext(node: JsonLdObject): JsonLdObject {
  return { "@context": CONTEXT, ...node };
}

export function buildJsonLdGraph(items: Array<JsonLdObject | null | undefined>): JsonLdObject {
  const graph = items.filter((item): item is JsonLdObject => Boolean(item));
  if (graph.length === 0) {
    return withContext({ "@type": "WebPage" });
  }
  if (graph.length === 1) {
    return withContext(graph[0]);
  }
  return {
    "@context": CONTEXT,
    "@graph": graph,
  };
}

export function personJsonLd(overrides: JsonLdObject = {}): JsonLdObject {
  const orgRef = { "@id": `${seoConfig.siteUrl}/#organization` };
  // Schema.org: founder lives on Organization; Person uses worksFor / affiliation.
  return {
    "@type": "Person",
    "@id": `${seoConfig.siteUrl}/#person`,
    name: seoConfig.person.name,
    jobTitle: seoConfig.person.jobTitle,
    email: seoConfig.person.email,
    url: seoConfig.person.url,
    image: absoluteUrl(seoConfig.person.image),
    sameAs: seoConfig.person.sameAs,
    knowsAbout: seoConfig.person.knowsAbout,
    worksFor: orgRef,
    ...overrides,
  };
}

export function organizationJsonLd(overrides: JsonLdObject = {}): JsonLdObject {
  const node: JsonLdObject = {
    "@type": "Organization",
    "@id": `${seoConfig.siteUrl}/#organization`,
    name: seoConfig.organization.name,
    url: seoConfig.organization.url,
    email: seoConfig.organization.email,
    ...overrides,
  };
  if (seoConfig.organization.founderRelation === "founder") {
    node.founder = { "@id": `${seoConfig.siteUrl}/#person` };
  }
  return node;
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": `${seoConfig.siteUrl}/#website`,
    url: seoConfig.siteUrl,
    name: seoConfig.siteName,
    description: seoConfig.defaultDescription,
    inLanguage: ["fr", "en"],
    publisher: { "@id": `${seoConfig.siteUrl}/#person` },
  };
}

export function profilePageJsonLd(path = "/about/"): JsonLdObject {
  return {
    "@type": "ProfilePage",
    "@id": absoluteUrl(path),
    url: absoluteUrl(path),
    name: `${seoConfig.person.name} — About`,
    mainEntity: { "@id": `${seoConfig.siteUrl}/#person` },
    isPartOf: { "@id": `${seoConfig.siteUrl}/#website` },
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
    isPartOf: { "@id": `${seoConfig.siteUrl}/#website` },
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
    headline: input.title,
    description: input.description,
    inLanguage: input.lang,
    datePublished: published,
    dateModified: modified,
    image: input.image ? absoluteUrl(input.image) : seoConfig.defaultImage,
    author: { "@id": `${seoConfig.siteUrl}/#person` },
    publisher: { "@id": `${seoConfig.siteUrl}/#person` },
    mainEntityOfPage: absoluteUrl(input.path),
    isPartOf: { "@id": `${seoConfig.siteUrl}/#website` },
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
    author: { "@id": `${seoConfig.siteUrl}/#person` },
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
  repository?: string;
}): JsonLdObject {
  const node: JsonLdObject = {
    "@type": "WebPage",
    "@id": absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    inLanguage: input.lang ?? "fr",
    author: { "@id": `${seoConfig.siteUrl}/#person` },
    isPartOf: { "@id": `${seoConfig.siteUrl}/#website` },
  };
  if (input.relatedToOmnivya) {
    node.about = { "@id": `${seoConfig.siteUrl}/#organization` };
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
    performer: { "@id": `${seoConfig.siteUrl}/#person` },
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
    provider: { "@id": `${seoConfig.siteUrl}/#person` },
    areaServed: "EU",
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
