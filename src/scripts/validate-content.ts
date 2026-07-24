/**
 * Semantic consistency checks for the Omnivya ecosystem narrative (Prompt 8).
 * Run: bun run validate:content
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ecosystemEntities,
  ecosystemRelations,
  ecosystemTimeline,
  type EcosystemEntityId,
  type EcosystemLocale,
} from "../data/ecosystem.ts";
import { buildEcosystemEntityNodes, ecosystemJsonLdIds } from "../lib/ecosystem-json-ld.ts";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
let failures = 0;

function fail(message: string) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function ok(message: string) {
  console.log(`OK: ${message}`);
}

function charLen(value: string): number {
  return [...value].length;
}

async function walkFiles(dir: string, exts: string[]): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      out.push(...(await walkFiles(path, exts)));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(path);
    }
  }
  return out;
}

/** Dangerous phrases that reintroduce known false narratives. */
const FORBIDDEN_PATTERNS: Array<{ id: string; pattern: RegExp; why: string }> = [
  {
    id: "it-challenge-current-brand",
    pattern:
      /IT Challenge[^.\n]{0,80}(marque (stratégique )?actuelle|current (strategic )?brand|branche active)/i,
    why: "IT Challenge must not be framed as a current strategic brand",
  },
  {
    id: "expert-algeria-only",
    pattern:
      /Omnivya Expert[^.\n]{0,100}(uniquement (en )?Algérie|only (in )?Algeria|Algérie uniquement)/i,
    why: "Omnivya Expert must not be limited to Algeria",
  },
  {
    id: "expert-europe-only",
    pattern:
      /Omnivya Expert[^.\n]{0,100}(uniquement (en )?Europe|only (in )?Europe|Europe uniquement)/i,
    why: "Omnivya Expert must not be limited to Europe",
  },
  {
    id: "algeria-from-origin",
    pattern:
      /(Algérie|Algeria)[^.\n]{0,80}(dès l[’']origine|from the (very )?start|prévue dès|planned from the (outset|beginning))/i,
    why: "Algeria expansion was not in the original plan",
  },
  {
    id: "omnivya-simple-rename",
    pattern: /Omnivya[\s\S]{0,80}(simple renommage|simple rename|renommage (juridique )?de Simplifi)/i,
    why: "Omnivya is not a simple rename of Simplifi’ED",
  },
];

async function assertSsotInvariants() {
  const expert = ecosystemEntities["omnivya-expert"];
  const itChallenge = ecosystemEntities["it-challenge"];
  const simplified = ecosystemEntities.simplified;
  const omnivya = ecosystemEntities.omnivya;

  if (expert.geo !== "europe_africa") {
    fail("Omnivya Expert geo must be europe_africa");
  } else {
    ok("Omnivya Expert geo is europe_africa");
  }

  if (itChallenge.brandPosture !== "legacy_invoice_only") {
    fail("IT Challenge brandPosture must be legacy_invoice_only");
  } else {
    ok("IT Challenge brand posture is legacy_invoice_only");
  }

  if (itChallenge.legalPosture !== "active") {
    fail("IT Challenge legalPosture must stay active");
  } else {
    ok("IT Challenge legal posture is active");
  }

  if (simplified.brandPosture !== "historical") {
    fail("Simplifi’ED brandPosture must be historical");
  } else {
    ok("Simplifi’ED brand posture is historical");
  }

  if (simplified.createdAt !== "2020-08-04") {
    fail(`Simplifi’ED createdAt must be 2020-08-04 (got ${simplified.createdAt})`);
  } else {
    ok("Simplifi’ED createdAt is 2020-08-04");
  }

  if (omnivya.brandSince !== "2025") {
    fail(`Omnivya brandSince must be 2025 (got ${omnivya.brandSince})`);
  } else {
    ok("Omnivya brandSince is 2025");
  }

  const currentBrands = Object.values(ecosystemEntities).filter((e) => e.brandPosture === "current");
  const currentNames = currentBrands.map((e) => e.canonicalName);
  if (currentNames.includes("Simplifi’ED") || currentNames.includes("IT Challenge")) {
    fail("Legacy names must not appear as current brands");
  } else {
    ok("Current brands exclude Simplifi’ED and IT Challenge");
  }

  const hubLinks = ecosystemRelations.filter((r) => r.type === "hub_of" && r.from === "omnivya");
  if (!hubLinks.some((r) => r.to === "omnivya-expert")) {
    fail("Omnivya must hub_of Omnivya Expert");
  } else {
    ok("Omnivya hubs Omnivya Expert");
  }

  const algeriaStep = ecosystemTimeline.find((s) => s.id === "algeria-capacity");
  if (!algeriaStep?.summary.fr.includes("pas le plan d’origine")) {
    fail("Timeline must state Algeria was not the original plan");
  } else {
    ok("Timeline keeps Algeria-as-later-decision");
  }
}

async function assertDescriptionBands() {
  const locales: EcosystemLocale[] = ["fr", "en"];
  const ids = Object.keys(ecosystemEntities) as EcosystemEntityId[];

  for (const id of ids) {
    const entity = ecosystemEntities[id];
    for (const locale of locales) {
      const card = charLen(entity.shortDescription[locale]);
      const meta = charLen(entity.metaDescription[locale]);
      if (card < 55 || card > 95) {
        fail(`${id}.${locale} card length ${card} outside soft band 55–95`);
      }
      if (meta < 130 || meta > 170) {
        fail(`${id}.${locale} meta length ${meta} outside soft band 130–170`);
      }
      if (!entity.longDescription[locale]?.trim()) {
        fail(`${id}.${locale} missing editorial description`);
      }
    }
  }
  ok("Description bands within soft limits for all entities");
}

async function assertJsonLdUniqueness() {
  for (const locale of ["fr", "en"] as EcosystemLocale[]) {
    const nodes = buildEcosystemEntityNodes(locale);
    const ids = nodes.map((n) => String(n["@id"] ?? ""));
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      fail(`Duplicate JSON-LD @id in ${locale} graph`);
    }
  }

  const expected = Object.values(ecosystemJsonLdIds);
  if (new Set(expected).size !== expected.length) {
    fail("ecosystemJsonLdIds has duplicate fragment URLs");
  } else {
    ok("JSON-LD @id fragments are unique");
  }
}

async function assertNoForbiddenCopy() {
  const dirs = [
    join(ROOT, "src/config"),
    join(ROOT, "src/content/projects"),
    join(ROOT, "src/components"),
    join(ROOT, "src/data"),
    join(ROOT, "public"),
    join(ROOT, "docs"),
  ];
  const files: string[] = [];
  for (const dir of dirs) {
    files.push(...(await walkFiles(dir, [".ts", ".astro", ".md", ".txt", ".html"])));
  }

  // Self file defines the patterns — skip false positives from this script and editorial.dont lists.
  const skip = new Set([
    join(ROOT, "src/scripts/validate-content.ts"),
    join(ROOT, "src/data/ecosystem.ts"),
  ]);

  for (const file of files) {
    if (skip.has(file)) continue;
    const text = await readFile(file, "utf8");
    for (const rule of FORBIDDEN_PATTERNS) {
      for (const match of text.matchAll(
        new RegExp(rule.pattern, rule.pattern.flags.includes("g") ? rule.pattern.flags : `${rule.pattern.flags}g`),
      )) {
        const matched = match[0] ?? "";
        // Negations in the matched span ("pas un simple renommage") are allowed.
        if (/\bpas\b|\bnot\b|ne pas|do not|n’est pas|is not/i.test(matched)) continue;
        fail(`${rule.id} in ${file.replace(ROOT + "/", "")}: ${rule.why}`);
      }
    }
  }
  ok("No forbidden narrative patterns in scanned surfaces");
}

async function assertProjectSummariesAligned() {
  const map: Record<string, EcosystemEntityId> = {
    "omnivya.md": "omnivya",
    "my-dare.md": "my-dare",
    "sanad.md": "sanad",
  };
  for (const [file, id] of Object.entries(map)) {
    const path = join(ROOT, "src/content/projects", file);
    const text = await readFile(path, "utf8");
    const summary = text.match(/^summary:\s*"([^"]+)"/m)?.[1];
    const summaryEn = text.match(/^summary_en:\s*"([^"]+)"/m)?.[1];
    const entity = ecosystemEntities[id];
    if (summary !== entity.shortDescription.fr) {
      fail(`${file} summary must match SSOT card FR`);
    }
    if (summaryEn !== entity.shortDescription.en) {
      fail(`${file} summary_en must match SSOT card EN`);
    }
  }
  ok("Project card summaries match SSOT");
}

async function main() {
  console.log("validate:content — ecosystem semantic checks\n");
  await assertSsotInvariants();
  await assertDescriptionBands();
  await assertJsonLdUniqueness();
  await assertNoForbiddenCopy();
  await assertProjectSummariesAligned();

  if (failures > 0) {
    console.error(`\n${failures} failure(s)`);
    process.exit(1);
  }
  console.log("\nAll content validations passed.");
}

await main();
