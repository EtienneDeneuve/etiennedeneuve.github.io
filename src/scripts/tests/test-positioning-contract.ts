import { websiteJsonLd } from "../../lib/json-ld.ts";
import { messagingConfig } from "../../config/messaging.ts";
import { seoConfig } from "../../config/seo.ts";
import { siteConfig } from "../../config/site.ts";

const expectedRole = messagingConfig.etienne.role.fr;

if (!messagingConfig.etienne.positioning.fr.includes("plateformes critiques")) {
  throw new Error("FR critical-platform positioning drifted");
}
if (!messagingConfig.etienne.positioning.en.includes("critical platforms")) {
  throw new Error("EN critical-platform positioning drifted");
}

if (siteConfig.professionalRole.title !== expectedRole) {
  throw new Error("professionalRole.title drifted from messagingConfig");
}

if (siteConfig.professionalRole.subtitle !== messagingConfig.etienne.promise.fr) {
  throw new Error("professionalRole.subtitle drifted from canonical promise");
}

for (const lang of ["fr", "en"] as const) {
  if (
    siteConfig.professionalRole.titleByLang[lang] !== messagingConfig.etienne.role[lang]
  ) {
    throw new Error(`localized role drifted for ${lang}`);
  }
  if (seoConfig.defaultDescription[lang] !== messagingConfig.etienne.seoDescription[lang]) {
    throw new Error(`SEO description drifted for ${lang}`);
  }
}

if (seoConfig.person.jobTitle !== expectedRole) {
  throw new Error("JSON-LD person jobTitle drifted from canonical role");
}

for (const lang of ["fr", "en"] as const) {
  if (websiteJsonLd(lang).description !== messagingConfig.etienne.seoDescription[lang]) {
    throw new Error(`WebSite JSON-LD description drifted for ${lang}`);
  }
}

const serialized = JSON.stringify({
  professionalRole: siteConfig.professionalRole,
  seo: siteConfig.seo,
  legacyAuthor: siteConfig.author,
  legacySite: siteConfig.site,
});

for (const stale of [
  "software to cloud and AI",
  "Management, productivité et ingénierie",
  "CTO expert — la technique vaut ce qu’elle change",
]) {
  if (serialized.includes(stale)) {
    throw new Error(`stale positioning copy returned: ${stale}`);
  }
}

console.log("Positioning contract OK");
