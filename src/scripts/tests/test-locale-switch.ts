import {
  resolveLocaleSwitchPath,
  stripLocalePrefix,
  withLocalePrefix,
} from "../../lib/locale-switch.ts";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    failed += 1;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`OK: ${message}`);
  }
}

assert(stripLocalePrefix("/en/about/") === "/about", "strip /en/about");
assert(stripLocalePrefix("/about/") === "/about", "strip /about");
assert(stripLocalePrefix("/en/") === "/", "strip /en/");
assert(withLocalePrefix("/thinking", "en") === "/en/thinking/", "prefix thinking EN");
assert(withLocalePrefix("/", "en") === "/en/", "prefix home EN");
assert(withLocalePrefix("/contact", "fr") === "/contact/", "prefix contact FR");

assert(resolveLocaleSwitchPath("/", "en") === "/en/", "home → EN");
assert(resolveLocaleSwitchPath("/en/", "fr") === "/", "EN home → FR");
assert(resolveLocaleSwitchPath("/about/", "en") === "/en/about/", "about → EN");
assert(resolveLocaleSwitchPath("/en/work/", "fr") === "/work/", "EN work → FR");
assert(
  resolveLocaleSwitchPath("/thinking/2026-07-06-observabilite-contrat-testable/", "en") ===
    "/en/thinking/",
  "FR article without pair → EN thinking index"
);
assert(
  resolveLocaleSwitchPath("/thinking/foo/", "en", "/en/thinking/foo-en/") ===
    "/en/thinking/foo-en/",
  "explicit translationHref wins"
);
assert(
  resolveLocaleSwitchPath("/thinking/type/doctrine/", "en") === "/en/thinking/type/doctrine/",
  "facet stays paired"
);
assert(resolveLocaleSwitchPath("/design-system/", "en") === "/en/", "unknown → EN home");

if (failed > 0) {
  console.error(`\n${failed} locale-switch assertion(s) failed`);
  process.exit(1);
}

console.log("\nAll locale-switch tests passed.");
