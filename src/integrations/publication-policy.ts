import type { AstroIntegration } from "astro";
import { runPublicationPolicyChecks } from "../lib/publication-policy.ts";

async function enforcePublicationPolicy(logger: {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}) {
  const { getCollection } = await import("astro:content");

  const [blog, caseStudies, projects, appearances, resources] = await Promise.all([
    getCollection("blog"),
    getCollection("caseStudies"),
    getCollection("projects"),
    getCollection("appearances"),
    getCollection("resources"),
  ]);

  const result = runPublicationPolicyChecks({
    blog,
    caseStudies,
    projects,
    appearances,
    resources,
  });

  for (const warning of result.warnings) {
    logger.warn(`[publication-policy] ${warning.path}: ${warning.message}`);
  }

  if (!result.ok) {
    for (const error of result.errors) {
      logger.error(`[publication-policy] ${error.path}: ${error.message}`);
    }
    throw new Error(
      `Publication policy failed with ${result.errors.length} error(s). See docs/evidence-policy.md`
    );
  }

  logger.info("[publication-policy] All publishable content passed validation.");
}

export function publicationPolicyIntegration(): AstroIntegration {
  return {
    name: "publication-policy",
    hooks: {
      "astro:build:start": async ({ logger }) => {
        await enforcePublicationPolicy(logger);
      },
      "astro:server:start": async ({ logger }) => {
        await enforcePublicationPolicy(logger);
      },
    },
  };
}

export default publicationPolicyIntegration;
