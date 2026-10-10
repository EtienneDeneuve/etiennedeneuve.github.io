/**
 * Resolve the opposite-locale URL for the language switcher.
 * Prefers a real translation pair when provided; never invents article equivalents.
 */

export type UiLang = "fr" | "en";

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

/** Strip optional `/en` prefix; returns a FR-shaped path without trailing slash (except `/`). */
export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (normalized === "/en") return "/";
  if (normalized.startsWith("/en/")) {
    const rest = normalized.slice(3);
    return rest || "/";
  }
  return normalized;
}

export function withLocalePrefix(barePath: string, lang: UiLang): string {
  const bare = normalizePathname(barePath);
  if (lang === "fr") {
    return bare === "/" ? "/" : `${bare}/`;
  }
  if (bare === "/") return "/en/";
  return `/en${bare}/`;
}

/**
 * Paths that have a real bilingual page pair (same content, different chrome).
 * Article detail URLs are NOT listed — without a translationKey sibling they fall back to Thinking index.
 */
const BILINGUAL_EXACT = new Set([
  "/",
  "/about",
  "/work",
  "/work/case-studies",
  "/thinking",
  "/start-here",
  "/speaking",
  "/projects",
  "/contact",
]);

function isBilingualBarePath(bare: string): boolean {
  if (BILINGUAL_EXACT.has(bare)) return true;
  if (bare.startsWith("/thinking/type/")) return true;
  if (bare.startsWith("/thinking/pillar/")) return true;
  if (bare.startsWith("/thinking/tag/")) return true;
  if (bare.startsWith("/projects/") && bare !== "/projects") return true;
  if (bare.startsWith("/work/case-studies/") && bare !== "/work/case-studies") return true;
  return false;
}

function isThinkingArticleBarePath(bare: string): boolean {
  if (!bare.startsWith("/thinking/")) return false;
  if (bare === "/thinking") return false;
  if (bare.startsWith("/thinking/type/")) return false;
  if (bare.startsWith("/thinking/pillar/")) return false;
  if (bare.startsWith("/thinking/tag/")) return false;
  if (bare.startsWith("/thinking/rss/")) return false;
  return true;
}

/**
 * @param pathname Current URL pathname
 * @param targetLang Language to switch to
 * @param translationHref Optional real sibling URL (article with translationKey)
 */
export function resolveLocaleSwitchPath(
  pathname: string,
  targetLang: UiLang,
  translationHref?: string | null
): string {
  if (translationHref) {
    const normalized = normalizePathname(translationHref);
    return normalized === "/" ? "/" : `${normalized}/`;
  }

  const bare = stripLocalePrefix(pathname);

  if (isThinkingArticleBarePath(bare)) {
    return withLocalePrefix("/thinking", targetLang);
  }

  if (isBilingualBarePath(bare)) {
    return withLocalePrefix(bare, targetLang);
  }

  // Unknown / monolingual surface → home of the target language
  return withLocalePrefix("/", targetLang);
}
