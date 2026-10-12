/**
 * Editorial guards for EN translations of the Thinking series (OTel, Nix/Entra, CI).
 * Source-level checks — no Astro content runtime required.
 *
 * Fails when:
 * - an EN sibling is missing for a series FR stem
 * - language / translationKey / pubDate / draft drift vs FR
 * - residual French markers appear outside intended proper nouns
 * - escaped inline backticks (\`) remain in EN prose
 * - a future-dated pair would publish before its Paris calendar day
 * - EN relatedArticles point at FR stems that have EN siblings
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { thinkingConfig } from "../../config/thinking.ts";
import { isReleasedByPubDate } from "../../lib/publication-policy.ts";
import { getArticlePath } from "../../lib/thinking.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogDir = join(__dirname, "../../content/blog");

/** Freeze “today” for scheduled-publish assertions (PR review date context). */
const REVIEW_NOW = new Date("2026-10-12T12:00:00.000Z");

const seriesIds = thinkingConfig.series.flatMap((s) => [...s.articleIds]);

type Fm = {
  title?: string;
  language?: string;
  translationKey?: string;
  pubDate?: string;
  draft?: boolean;
  relatedArticles?: string[];
};

function parseFrontmatter(raw: string): { fm: Fm; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("missing frontmatter");
  const block = match[1]!;
  const body = match[2]!;
  const fm: Fm = {};
  const related: string[] = [];
  let inRelated = false;
  for (const line of block.split(/\r?\n/)) {
    if (/^relatedArticles:\s*$/.test(line)) {
      inRelated = true;
      continue;
    }
    if (inRelated) {
      const item = line.match(/^\s*-\s+(.+)\s*$/);
      if (item) {
        related.push(item[1]!.replace(/^["']|["']$/g, ""));
        continue;
      }
      if (/^\S/.test(line)) inRelated = false;
      else continue;
    }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1]!;
    let value = kv[2]!.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === "language") fm.language = value;
    else if (key === "translationKey") fm.translationKey = value;
    else if (key === "pubDate") fm.pubDate = value;
    else if (key === "title") fm.title = value;
    else if (key === "draft") fm.draft = value === "true";
  }
  if (related.length) fm.relatedArticles = related;
  return { fm, body };
}

function readPair(stem: string): { fr: { fm: Fm; body: string; path: string }; en: { fm: Fm; body: string; path: string } } {
  const frPath = join(blogDir, `${stem}.md`);
  const enPath = join(blogDir, `${stem}-en.md`);
  if (!existsSync(frPath)) throw new Error(`missing FR ${stem}.md`);
  if (!existsSync(enPath)) throw new Error(`missing EN ${stem}-en.md`);
  return {
    fr: { ...parseFrontmatter(readFileSync(frPath, "utf8")), path: frPath },
    en: { ...parseFrontmatter(readFileSync(enPath, "utf8")), path: enPath },
  };
}

/**
 * High-signal residual FR markers in EN bodies.
 * Proper nouns / shared tech terms (Entra, Nix, devenv) are not listed.
 */
const RESIDUAL_FR: { re: RegExp; label: string }[] = [
  { re: /\bApplications et runtimes\b/, label: "FR Mermaid: Applications et" },
  { re: /\bCode humain ou agent\b/, label: "FR Mermaid: Code humain" },
  { re: /\bChecks locaux\b/, label: "FR Mermaid: Checks locaux" },
  { re: /\bPreuve liée\b/, label: "FR Mermaid: Preuve liée" },
  { re: /\bMerge selon les règles\b/, label: "FR Mermaid: Merge selon" },
  { re: /\bSplunk pendant la transition\b/, label: "FR Mermaid: Splunk pendant" },
  { re: /\bNix sur le Mac\b/, label: "FR diagram: Nix sur le Mac" },
  { re: /\boutils du poste\b/, label: "FR diagram: outils du poste" },
  { re: /\bgroupes Entra\b/, label: "FR diagram: groupes Entra" },
  { re: /\bprofil Nix\b/, label: "FR diagram: profil Nix" },
  { re: /\bMac existant\b/, label: "FR diagram: Mac existant" },
  { re: /\bMac neuf\b/, label: "FR diagram: Mac neuf" },
  { re: /\bétat des lieux\b/, label: "FR diagram: état des lieux" },
  { re: /\bprofil cible\b/, label: "FR diagram: profil cible" },
  { re: /\bregistry artefact disponible\b/, label: "FR diagram: registry artefact" },
  { re: /^\s*sinon\s*$/m, label: "FR diagram: sinon" },
  { re: /\bpuis dans les deux cas\b/, label: "FR diagram: puis dans les deux cas" },
  { re: /\bmême état versionné\b/, label: "FR diagram: même état versionné" },
  { re: /\bBase N-1 déjà peuplée\b/, label: "FR diagram: Base N-1" },
  { re: /\boutilisateur zine\b/, label: "FR diagram: utilisateur zine" },
  { re: /\brôle tech\b/, label: "FR diagram: rôle tech" },
  { re: /\bsystème actif\b/, label: "FR UI: système actif" },
  { re: /\bil y a \d+ h\b/, label: "FR UI: il y a N h" },
  { re: /IMAGE À INTÉGRER/, label: "FR HTML comment: IMAGE À INTÉGRER" },
  { re: /\bLégende\s*:/, label: "FR HTML comment: Légende" },
  { re: /\bGarder \d+ à \d+ lignes\b/, label: "FR screenshot note" },
  { re: /\\`[A-Za-z0-9_./:-]+\\`/, label: "escaped inline backticks" },
];

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    failed += 1;
    console.error(`FAIL: ${message}`);
  }
}

assert(seriesIds.length === 15, `expected 15 series stems, got ${seriesIds.length}`);

const enStems = new Set(seriesIds.map((id) => `${id}-en`));

for (const stem of seriesIds) {
  const { fr, en } = readPair(stem);

  assert(fr.fm.language === "fr", `${stem}: FR language=fr`);
  assert(en.fm.language === "en", `${stem}-en: language=en`);
  assert(fr.fm.translationKey === stem, `${stem}: translationKey matches stem`);
  assert(en.fm.translationKey === stem, `${stem}-en: translationKey matches FR stem`);
  assert(fr.fm.pubDate === en.fm.pubDate, `${stem}: pubDate FR/EN match (${fr.fm.pubDate} vs ${en.fm.pubDate})`);
  assert(
    Boolean(fr.fm.draft) === Boolean(en.fm.draft),
    `${stem}: draft FR/EN match (${fr.fm.draft} vs ${en.fm.draft})`
  );

  const frReleased = isReleasedByPubDate(
    { data: { draft: fr.fm.draft ?? false, pubDate: fr.fm.pubDate! } },
    REVIEW_NOW
  );
  const enReleased = isReleasedByPubDate(
    { data: { draft: en.fm.draft ?? false, pubDate: en.fm.pubDate! } },
    REVIEW_NOW
  );
  assert(frReleased === enReleased, `${stem}: release gate FR/EN aligned at REVIEW_NOW`);
  if (new Date(fr.fm.pubDate!).getTime() > REVIEW_NOW.getTime()) {
    assert(!enReleased, `${stem}-en: future pubDate must stay unpublished at REVIEW_NOW`);
  }

  for (const { re, label } of RESIDUAL_FR) {
    assert(!re.test(en.body), `${stem}-en: residual FR / MD issue — ${label}`);
  }

  const enPath = getArticlePath(`${stem}-en`, "en");
  assert(enPath === `/en/thinking/${stem}-en/`, `${stem}-en: EN canonical path`);
  const frPath = getArticlePath(stem, "fr");
  assert(frPath === `/thinking/${stem}/`, `${stem}: FR canonical path`);

  for (const related of en.fm.relatedArticles ?? []) {
    const relatedStem = related.endsWith("-en") ? related.slice(0, -3) : related;
    if (enStems.has(`${relatedStem}-en`) || seriesIds.includes(relatedStem)) {
      assert(
        related.endsWith("-en"),
        `${stem}-en: relatedArticles should use EN sibling id for series mate (got ${related})`
      );
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} thinking EN series assertion(s) failed`);
  process.exit(1);
}

console.log(`OK: ${seriesIds.length} EN series pairs checked (frontmatter, residue, scheduling, related).`);
