/**
 * Lightweight checks for #174 related/series helpers without astro:content.
 * Mirrors the pure logic in thinking-locale + series stem rules.
 */
import { resolveThinkingLanguageScope } from "../../lib/thinking-locale.ts";
import { thinkingConfig } from "../../config/thinking.ts";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(thinkingConfig.series.length === 3, "three editorial series configured");
assert(
  thinkingConfig.articleCtas["2026-07-08-gitops-separer-versions-infra-et-images"] != null,
  "gitops CTA configured"
);
assert(
  resolveThinkingLanguageScope("en", new URLSearchParams()) === "en",
  "locale scope still defaults to UI lang"
);

const otel = thinkingConfig.series.find((s) => s.id === "otel");
assert(Boolean(otel), "otel series present");
assert(otel!.articleIds.length === 4, "otel has 4 parts");

const nix = thinkingConfig.series.find((s) => s.id === "nix-entra");
assert(Boolean(nix), "nix-entra series present");
assert(nix!.articleIds.length === 5, "nix-entra has 5 editorial parts");
assert(
  nix!.articleIds[0] === "2026-10-03-provisioning-mac-pas-probleme-mdm",
  "nix-entra starts with MDM article"
);

console.log("test-thinking-related-series: ok");
