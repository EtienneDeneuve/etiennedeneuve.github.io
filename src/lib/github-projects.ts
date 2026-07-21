import cacheData from "../data/github-projects-cache.json";
import {
  githubProjectCategories,
  githubProjectCategoryLabels,
  type GitHubProjectCategory,
} from "../config/github-projects.ts";

export type GitHubProjectEntry = {
  id: string;
  category: GitHubProjectCategory;
  github: { owner: string; repo: string };
  name: { fr: string; en: string };
  problem: { fr: string; en: string };
  status: { fr: string; en: string };
  role: { fr: string; en: string };
  documentation: { fr: string; en: string };
  documentationUrl?: string;
  contributionSought: { fr: string; en: string };
  relatedProjectSlug?: string;
  displayOrder: number;
  htmlUrl: string;
  language: string | null;
  license: string | null;
  lastUpdated: string | null;
  metadataStatus: "fresh" | "stale" | "static";
};

export type GitHubProjectsCache = {
  version: number;
  syncStatus: "fresh" | "stale" | "static";
  syncedAt: string | null;
  syncError: string | null;
  repositories: GitHubProjectEntry[];
};

export type GitHubProjectCategoryGroup = {
  category: GitHubProjectCategory;
  label: string;
  description: string;
  repositories: GitHubProjectEntry[];
};

export function loadGitHubProjects(): GitHubProjectsCache {
  return cacheData as GitHubProjectsCache;
}

export function getSortedGitHubProjects(_lang: "fr" | "en" = "fr"): GitHubProjectEntry[] {
  return [...loadGitHubProjects().repositories].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getGitHubProjectsByCategory(
  lang: "fr" | "en" = "fr"
): GitHubProjectCategoryGroup[] {
  const repos = getSortedGitHubProjects(lang);
  return githubProjectCategories
    .map((category) => {
      const meta = githubProjectCategoryLabels[category];
      return {
        category,
        label: meta[lang],
        description: meta.description[lang],
        repositories: repos.filter((repo) => repo.category === category),
      };
    })
    .filter((group) => group.repositories.length > 0);
}

export function isCacheStale(cache: GitHubProjectsCache): boolean {
  return cache.syncStatus === "stale" || cache.syncStatus === "static";
}
