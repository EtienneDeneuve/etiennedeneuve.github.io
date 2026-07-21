import { siteConfig } from "./site.ts";

/**
 * Single source of truth for document meta and identity used in SEO / JSON-LD.
 * Do not hardcode titles, canonicals, or OG images in page components.
 */

const siteUrl = siteConfig.seo.siteUrl.replace(/\/$/, "");

export type SeoLang = "fr" | "en";

export type SeoOgType = "website" | "article" | "profile";

export type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  lang?: SeoLang;
  /** Absolute or site-relative image URL — never include `/public/`. */
  image?: string;
  ogType?: SeoOgType;
  alternates?: Array<{ lang: SeoLang; href: string }>;
  robots?: string;
  noIndex?: boolean;
  publishedTime?: Date | string;
  modifiedTime?: Date | string;
  /** When true, append brand suffix to title if not already present. */
  brandTitle?: boolean;
};

export type ResolvedPageSeo = {
  title: string;
  description: string;
  canonical: string;
  lang: SeoLang;
  locale: string;
  alternateLocale: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  ogType: SeoOgType;
  robots: string;
  alternates: Array<{ lang: SeoLang | "x-default"; href: string }>;
  publishedTime?: string;
  modifiedTime?: string;
  siteName: string;
  twitterCard: "summary_large_image";
  twitterSite?: string;
  twitterCreator?: string;
};

function stripPublicSegment(url: string): string {
  return url.replace(/\/public\//g, "/");
}

function toAbsoluteUrl(pathOrUrl: string): string {
  const cleaned = stripPublicSegment(pathOrUrl.trim());
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const path = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${siteUrl}${path}`;
}

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.endsWith("/") ? withSlash : `${withSlash}/`;
}

function toIso(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export const seoConfig = {
  siteUrl,
  siteName: siteConfig.identity.name,
  defaultTitle: siteConfig.seo.title,
  defaultDescription: siteConfig.seo.description,
  defaultImage: stripPublicSegment(siteConfig.seo.defaultOgImage),
  imageWidth: 1200,
  imageHeight: 630,
  defaultRobots: siteConfig.seo.robots,
  locale: {
    fr: "fr_FR",
    en: "en_US",
  },
  defaultLanguage: siteConfig.seo.defaultLanguage as SeoLang,
  twitter: {
    site: "@EtienneDinfo",
    creator: "@EtienneDinfo",
  },
  person: {
    name: siteConfig.identity.name,
    jobTitle: siteConfig.professionalRole.title,
    email: siteConfig.omnivya.email,
    url: siteUrl,
    image: stripPublicSegment(siteConfig.seo.defaultOgImage),
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.github,
      siteConfig.social.x,
      siteConfig.social.youtube,
    ],
    knowsAbout: [
      "Platform engineering",
      "Kubernetes",
      "DevSecOps",
      "Cloud infrastructure",
      "Observability",
      "FinOps",
    ],
  },
  organization: {
    name: siteConfig.omnivya.name,
    url: siteConfig.omnivya.website,
    email: siteConfig.omnivya.email,
    founderRelation: "founder" as const,
  },
  rssPath: "/rss.xml",
} as const;

export function absoluteUrl(pathOrUrl: string): string {
  return toAbsoluteUrl(pathOrUrl);
}

export function assetUrl(path: string): string {
  const cleaned = stripPublicSegment(path).replace(/^\/public\//, "/");
  return toAbsoluteUrl(cleaned.startsWith("/") ? cleaned : `/${cleaned}`);
}

export function resolvePageSeo(input: PageSeoInput): ResolvedPageSeo {
  const lang = input.lang ?? seoConfig.defaultLanguage;
  const path = normalizePath(input.path);
  const canonical = toAbsoluteUrl(path);
  const image = toAbsoluteUrl(input.image ?? seoConfig.defaultImage);

  let title = input.title.trim();
  if (input.brandTitle !== false) {
    const suffix = ` | ${seoConfig.siteName}`;
    if (title !== seoConfig.siteName && !title.includes(seoConfig.siteName)) {
      title = `${title}${suffix}`;
    }
  }

  const description = input.description.trim();
  const robots = input.noIndex ? "noindex,nofollow" : (input.robots ?? seoConfig.defaultRobots);

  const alternates: ResolvedPageSeo["alternates"] = [];
  for (const alt of input.alternates ?? []) {
    alternates.push({
      lang: alt.lang,
      href: toAbsoluteUrl(normalizePath(alt.href)),
    });
  }
  const defaultAlt =
    input.alternates?.find((a) => a.lang === seoConfig.defaultLanguage) ?? input.alternates?.[0];
  if (defaultAlt) {
    alternates.push({
      lang: "x-default",
      href: toAbsoluteUrl(normalizePath(defaultAlt.href)),
    });
  }

  const publishedTime = toIso(input.publishedTime);
  let modifiedTime = toIso(input.modifiedTime);
  if (
    publishedTime &&
    modifiedTime &&
    new Date(modifiedTime).getTime() <= new Date(publishedTime).getTime()
  ) {
    modifiedTime = undefined;
  }

  return {
    title,
    description,
    canonical,
    lang,
    locale: seoConfig.locale[lang],
    alternateLocale: seoConfig.locale[lang === "fr" ? "en" : "fr"],
    image,
    imageWidth: seoConfig.imageWidth,
    imageHeight: seoConfig.imageHeight,
    ogType: input.ogType ?? "website",
    robots,
    alternates,
    publishedTime,
    modifiedTime,
    siteName: seoConfig.siteName,
    twitterCard: "summary_large_image",
    twitterSite: seoConfig.twitter.site,
    twitterCreator: seoConfig.twitter.creator,
  };
}
