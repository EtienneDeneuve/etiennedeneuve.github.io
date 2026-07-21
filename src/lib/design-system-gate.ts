/**
 * Design system page is only available in development
 * or when PUBLIC_SHOW_DESIGN_SYSTEM=true (never publish by default).
 */
export function isDesignSystemEnabled(): boolean {
  return import.meta.env.DEV === true || import.meta.env.PUBLIC_SHOW_DESIGN_SYSTEM === "true";
}
