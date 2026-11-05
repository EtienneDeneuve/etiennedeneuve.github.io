import { omnivyaMissionUrl } from "../../config/site.ts";
import { getPillarCta } from "../../lib/thinking.ts";

const expected = {
  observability: ["cloud-reliability-diagnostic", "diagnostic-cible"],
  "platform-engineering": ["platform-risk-review", "audit-plateforme"],
  "software-supply-chain": ["platform-risk-review", "audit-plateforme"],
  "systems-and-risk": ["platform-risk-review", "audit-plateforme"],
  "cloud-and-infrastructure": ["decision-review", "revue-architecture"],
  "technical-leadership": ["decision-review", "revue-architecture"],
} as const;

for (const [pillar, [offerId, missionSlug]] of Object.entries(expected)) {
  const cta = getPillarCta(pillar as keyof typeof expected);
  if (!cta) throw new Error(`Missing contextual CTA for pillar: ${pillar}`);
  if (cta.offerId !== offerId) {
    throw new Error(`Unexpected offer for ${pillar}: ${cta.offerId}`);
  }
  if (cta.missionSlug !== missionSlug) {
    throw new Error(`Unexpected mission for ${pillar}: ${cta.missionSlug}`);
  }
  if (!cta.question.fr || !cta.question.en || !cta.primaryLabel.fr || !cta.primaryLabel.en) {
    throw new Error(`Incomplete bilingual CTA for pillar: ${pillar}`);
  }
}

if (getPillarCta("product-and-markets") !== null) {
  throw new Error("Product/market writing must not be forced into a technical offer");
}

const frUrl = new URL(
  omnivyaMissionUrl("fr", "audit-plateforme", "thinking-platform", "article-test")
);
const enUrl = new URL(
  omnivyaMissionUrl("en", "diagnostic-cible", "thinking-observability", "article-test")
);

if (frUrl.pathname !== "/fr/missions/audit-plateforme/") {
  throw new Error(`Unexpected FR mission URL: ${frUrl.pathname}`);
}
if (enUrl.pathname !== "/missions/diagnostic-cible/") {
  throw new Error(`Unexpected EN mission URL: ${enUrl.pathname}`);
}
for (const url of [frUrl, enUrl]) {
  if (url.searchParams.get("utm_campaign") !== "thinking") {
    throw new Error("Thinking offer links must preserve campaign attribution");
  }
  if (url.searchParams.get("utm_term") !== "article-test") {
    throw new Error("Thinking offer links must preserve article attribution");
  }
}

console.log("Thinking contextual offer routing OK");
