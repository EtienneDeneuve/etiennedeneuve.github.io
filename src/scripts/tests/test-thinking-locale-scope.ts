import { resolveThinkingLanguageScope } from "../../lib/thinking-locale.ts";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(
  resolveThinkingLanguageScope("en", new URLSearchParams()) === "en",
  "EN index defaults to EN scope"
);
assert(
  resolveThinkingLanguageScope("fr", new URLSearchParams()) === "fr",
  "FR index defaults to FR scope"
);
assert(
  resolveThinkingLanguageScope("en", new URLSearchParams("lang=all")) === "all",
  "lang=all opens full library"
);
assert(
  resolveThinkingLanguageScope("en", new URLSearchParams("lang=fr")) === "fr",
  "EN chrome can still request FR"
);
assert(
  resolveThinkingLanguageScope("fr", new URLSearchParams("lang=en")) === "en",
  "FR chrome can still request EN"
);

console.log("test-thinking-locale-scope: ok");
