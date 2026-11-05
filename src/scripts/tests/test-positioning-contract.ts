import { messagingConfig } from "../../config/messaging.ts";
import { profileMessaging, siteConfig } from "../../config/site.ts";
import { seoConfig } from "../../config/seo.ts";
import { personJsonLd, websiteJsonLd } from "../../lib/json-ld.ts";

const errors: string[] = [];

function check(name: string, condition: boolean, detail?: string) {
  if (!condition) errors.push(`${name}${detail ? `: ${detail}` : ""}`);
}

check(
  "FR headline",
  messagingConfig.etienne.positioning.fr === profileMessaging.headline.fr
);
check(
  "EN headline",
  messagingConfig.etienne.positioning.en === profileMessaging.headline.en
);
check("FR promise", messagingConfig.etienne.promise.fr === profileMessaging.promise.fr);
check("EN promise", messagingConfig.etienne.promise.en === profileMessaging.promise.en);
check("job title", siteConfig.professionalRole.title === profileMessaging.jobTitle);
check("legacy job title", siteConfig.author.jobTitle === profileMessaging.jobTitle);
check("legacy tagline", siteConfig.author.tagline === profileMessaging.headline.fr);
check("SEO default", seoConfig.defaultDescription === profileMessaging.description.fr);
check(
  "SEO FR default",
  seoConfig.defaultDescriptionByLanguage.fr === profileMessaging.description.fr
);
check(
  "SEO EN default",
  seoConfig.defaultDescriptionByLanguage.en === profileMessaging.description.en
);
check("schema job title", personJsonLd().jobTitle === profileMessaging.jobTitle);
check(
  "website description",
  websiteJsonLd().description === profileMessaging.description.fr
);

const serialized = JSON.stringify({
  siteConfig,
  profileMessaging,
  positioning: messagingConfig.etienne.positioning,
  promise: messagingConfig.etienne.promise,
});

for (const stale of [
  "Management, productivité et ingénierie",
  "engineering leadership, productivity and hands-on work",
  "CTO expert — la technique vaut ce qu’elle change",
]) {
  check("stale positioning removed", !serialized.includes(stale), stale);
}

if (errors.length > 0) {
  console.error("Positioning contract failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Positioning contract OK");
