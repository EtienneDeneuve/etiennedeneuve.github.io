#!/usr/bin/env bun
/**
 * Sync GitHub metadata for editorially selected repositories only.
 * Never fails the build — writes stale cache on API errors.
 *
 * Usage: pnpm run sync:github-projects
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { githubProjectsEditorial } from "../config/github-projects.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const cachePath = join(rootDir, "src/data/github-projects-cache.json");

const USER_AGENT = "etienne-site-github-sync/1.0";

type CacheFile = {
  version: number;
  syncStatus: "fresh" | "stale" | "static";
  syncedAt: string | null;
  syncError: string | null;
  repositories: Array<Record<string, unknown>>;
};

type GitHubRepoResponse = {
  html_url: string;
  language: string | null;
  license: { spdx_id: string | null } | null;
  pushed_at: string | null;
  archived: boolean;
  message?: string;
};

function readExistingCache(): CacheFile | null {
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, "utf8")) as CacheFile;
  } catch {
    return null;
  }
}

function stableStringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function buildHtmlUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}

function isValidGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "github.com" && parsed.pathname.split("/").filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
}

async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<
  { ok: true; data: GitHubRepoResponse } | { ok: false; error: string; rateLimited: boolean }
> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": USER_AGENT,
      },
    });

    if (response.status === 403) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        return { ok: false, error: "GitHub rate limit exceeded", rateLimited: true };
      }
    }

    if (response.status === 404) {
      return { ok: false, error: `Repository not found: ${owner}/${repo}`, rateLimited: false };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: `GitHub API ${response.status} for ${owner}/${repo}`,
        rateLimited: response.status === 403,
      };
    }

    const data = (await response.json()) as GitHubRepoResponse;
    if (!isValidGitHubUrl(data.html_url)) {
      return { ok: false, error: `Invalid html_url for ${owner}/${repo}`, rateLimited: false };
    }

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      rateLimited: false,
    };
  }
}

function mergeEntry(
  editorial: (typeof githubProjectsEditorial)[number],
  previous: Record<string, unknown> | undefined,
  remote: GitHubRepoResponse | null,
  metadataStatus: "fresh" | "stale" | "static"
) {
  const htmlUrl = remote?.html_url ?? buildHtmlUrl(editorial.github.owner, editorial.github.repo);
  return {
    id: editorial.id,
    category: editorial.category,
    github: editorial.github,
    name: editorial.name,
    problem: editorial.problem,
    status: editorial.status,
    role: editorial.role,
    documentation: editorial.documentation,
    ...(editorial.documentationUrl ? { documentationUrl: editorial.documentationUrl } : {}),
    contributionSought: editorial.contributionSought,
    ...(editorial.relatedProjectSlug ? { relatedProjectSlug: editorial.relatedProjectSlug } : {}),
    displayOrder: editorial.displayOrder,
    htmlUrl,
    language: remote?.language ?? (previous?.language as string | null) ?? null,
    license: remote?.license?.spdx_id ?? (previous?.license as string | null) ?? null,
    lastUpdated: remote?.pushed_at ?? (previous?.lastUpdated as string | null) ?? null,
    metadataStatus,
  };
}

async function main() {
  const existing = readExistingCache();
  const previousById = new Map(
    (existing?.repositories ?? []).map((entry) => [entry.id as string, entry])
  );

  const errors: string[] = [];
  let rateLimited = false;
  let anyFresh = false;

  const repositories = [];

  for (const editorial of [...githubProjectsEditorial].sort(
    (a, b) => a.displayOrder - b.displayOrder
  )) {
    const previous = previousById.get(editorial.id);
    const result = await fetchRepoMetadata(editorial.github.owner, editorial.github.repo);

    if (result.ok) {
      repositories.push(mergeEntry(editorial, previous, result.data, "fresh"));
      anyFresh = true;
      console.log(`✓ ${editorial.github.owner}/${editorial.github.repo}`);
    } else {
      errors.push(result.error);
      if (result.rateLimited) rateLimited = true;
      console.warn(`⚠ ${editorial.id}: ${result.error} — using fallback`);
      repositories.push(mergeEntry(editorial, previous, null, previous ? "stale" : "static"));
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const syncStatus: CacheFile["syncStatus"] =
    rateLimited || errors.length > 0 ? "stale" : anyFresh ? "fresh" : "static";

  const output: CacheFile = {
    version: 1,
    syncStatus,
    syncedAt: anyFresh ? new Date().toISOString() : (existing?.syncedAt ?? null),
    syncError: errors.length > 0 ? errors.join("; ") : null,
    repositories,
  };

  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, stableStringify(output));

  console.log(`\nWrote ${cachePath}`);
  console.log(`Sync status: ${syncStatus}`);
  if (output.syncError) {
    console.warn(`Note: ${output.syncError}`);
    process.exitCode = 0;
  }
}

main().catch((error) => {
  console.error("sync-github-projects failed unexpectedly:", error);
  const existing = readExistingCache();
  if (existing) {
    writeFileSync(
      cachePath,
      stableStringify({
        ...existing,
        syncStatus: "stale",
        syncError: error instanceof Error ? error.message : String(error),
      })
    );
    console.warn("Preserved previous cache with stale status.");
    process.exitCode = 0;
  } else {
    process.exitCode = 1;
  }
});
