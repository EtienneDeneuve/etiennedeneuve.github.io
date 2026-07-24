import { getEcosystemConfigEntities } from "../data/ecosystem";

/**
 * Thin compatibility layer for existing UI.
 * Canonical definitions live in `src/data/ecosystem.ts`.
 */
export const ecosystemConfig = {
  entities: getEcosystemConfigEntities("en"),
} as const;
