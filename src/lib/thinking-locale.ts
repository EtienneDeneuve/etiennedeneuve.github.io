/** Effective language scope for Thinking lists: UI locale unless URL asks for FR, EN, or all. */
export function resolveThinkingLanguageScope(
  uiLang: "fr" | "en",
  searchParams: URLSearchParams
): "fr" | "en" | "all" {
  const raw = searchParams.get("lang");
  if (raw === "all") return "all";
  if (raw === "fr" || raw === "en") return raw;
  return uiLang;
}
