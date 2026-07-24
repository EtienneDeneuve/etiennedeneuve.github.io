#!/usr/bin/env bun
/**
 * Inventory site pages + scan sources/dist for AI-voice telltales (FR/EN).
 *
 * Usage:
 *   bun run audit:ai-voice
 *   bun run audit:ai-voice -- --source-only
 *   bun run audit:ai-voice -- --json
 *
 * Writes:
 *   docs/ai-voice-audit.md
 *   ~/Worklog/content/rewrites/ai-voice-audit.json (if Worklog exists)
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const distDir = join(rootDir, "dist");
const docsOut = join(rootDir, "docs/ai-voice-audit.md");

const PRIORITY_ROUTES = [
  "/",
  "/en/",
  "/start-here/",
  "/en/start-here/",
  "/about/",
  "/en/about/",
  "/work/",
  "/en/work/",
  "/thinking/",
  "/en/thinking/",
  "/projects/",
  "/en/projects/",
  "/speaking/",
  "/en/speaking/",
  "/contact/",
  "/en/contact/",
];

const args = process.argv.slice(2);
const sourceOnly = args.includes("--source-only");
const jsonOnly = args.includes("--json");

type Finding = {
  file: string;
  line: number;
  rule: string;
  severity: "high" | "medium" | "low";
  lang: "fr" | "en" | "both";
  match: string;
  context: string;
};

type PageEntry = {
  path: string;
  kind: "html" | "source";
};

/** Heuristic patterns — tuned for marketing/doctrine AI sludge, not code. */
const RULES: Array<{
  id: string;
  severity: Finding["severity"];
  lang: Finding["lang"];
  re: RegExp;
  note: string;
}> = [
  {
    id: "em-dash",
    severity: "high",
    lang: "both",
    re: /\u2014/,
    note: "Tiret cadratin (—) : signature typographique LLM fréquente",
  },
  {
    id: "en-dash-as-pause",
    severity: "medium",
    lang: "both",
    re: /\u2013/,
    note: "Tiret demi-cadratin (–) souvent abusé comme pause",
  },
  {
    id: "fr-pas-seulement",
    severity: "high",
    lang: "fr",
    re: /pas seulement[^.]{0,80}(mais aussi|c['']est)/i,
    note: "Structure « pas seulement … mais / c'est »",
  },
  {
    id: "fr-il-est-important",
    severity: "high",
    lang: "fr",
    re: /\bil est (important|essentiel|crucial) de (noter|souligner|rappeler|comprendre)\b/i,
    note: "Amorce méta « il est important de … »",
  },
  {
    id: "fr-dans-un-monde",
    severity: "high",
    lang: "fr",
    re: /\bdans un monde (où|en (pleine|constante))\b/i,
    note: "Ouverture générique « dans un monde … »",
  },
  {
    id: "fr-force-constater",
    severity: "medium",
    lang: "fr",
    re: /\bforce est de constater\b/i,
    note: "Locution journalistique LLM",
  },
  {
    id: "fr-sinscrit",
    severity: "medium",
    lang: "fr",
    re: /\bs['']inscrit dans\b/i,
    note: "« s'inscrit dans » (souvent creux)",
  },
  {
    id: "fr-au-coeur",
    severity: "low",
    lang: "fr",
    re: /\bau c[œo]ur de\b/i,
    note: "Métaphore « au cœur de » (surveiller la densité)",
  },
  {
    id: "fr-levier",
    severity: "medium",
    lang: "fr",
    re: /\b(v[ée]ritable |puissant )?levier\b/i,
    note: "« levier » marketing",
  },
  {
    id: "fr-holistique",
    severity: "high",
    lang: "fr",
    re: /\bholistique\b/i,
    note: "Buzzword « holistique »",
  },
  {
    id: "fr-synergie",
    severity: "high",
    lang: "fr",
    re: /\bsynergie(s)?\b/i,
    note: "Buzzword « synergie »",
  },
  {
    id: "fr-paysage",
    severity: "medium",
    lang: "fr",
    re: /\bdans le paysage\b/i,
    note: "« dans le paysage … »",
  },
  {
    id: "fr-il-convient",
    severity: "medium",
    lang: "fr",
    re: /\bil convient de\b/i,
    note: "« il convient de »",
  },
  {
    id: "fr-permettant-ainsi",
    severity: "medium",
    lang: "fr",
    re: /\bpermettant ainsi\b/i,
    note: "Gerondif « permettant ainsi »",
  },
  {
    id: "fr-en-conclusion",
    severity: "low",
    lang: "fr",
    re: /\ben conclusion\b/i,
    note: "Clôture scolaire « en conclusion »",
  },
  {
    id: "fr-naviguer",
    severity: "medium",
    lang: "fr",
    re: /\bnaviguer (dans|à travers|entre)\b/i,
    note: "Métaphore « naviguer dans … »",
  },
  {
    id: "en-delve",
    severity: "high",
    lang: "en",
    re: /\bdelve(s|d)?\b/i,
    note: "English LLM tell: delve",
  },
  {
    id: "en-landscape",
    severity: "medium",
    lang: "en",
    re: /\b(the|this|today'?s)\s+\w*\s*landscape\b/i,
    note: "English LLM tell: … landscape",
  },
  {
    id: "en-leverage",
    severity: "medium",
    lang: "en",
    re: /\bleverage\b/i,
    note: "English LLM tell: leverage",
  },
  {
    id: "en-seamless",
    severity: "medium",
    lang: "en",
    re: /\bseamless(ly)?\b/i,
    note: "English LLM tell: seamless",
  },
  {
    id: "en-robust",
    severity: "low",
    lang: "en",
    re: /\brobust\b/i,
    note: "English LLM tell: robust (context-dependent)",
  },
  {
    id: "en-important-to-note",
    severity: "high",
    lang: "en",
    re: /\bit['']s important to (note|understand|recognize|remember)\b/i,
    note: "English meta opener",
  },
  {
    id: "en-in-todays",
    severity: "high",
    lang: "en",
    re: /\bin today['']s (digital|fast-paced|ever-changing)\b/i,
    note: "English stock opener",
  },
  {
    id: "en-furthermore",
    severity: "low",
    lang: "en",
    re: /\b(furthermore|moreover|additionally),/i,
    note: "English transition padding",
  },
  {
    id: "en-not-just-but",
    severity: "high",
    lang: "en",
    re: /\bnot (just|only)\b[^.]{0,60}\bbut (also|rather)\b/i,
    note: "English « not just … but … »",
  },
  {
    id: "en-underscore",
    severity: "medium",
    lang: "en",
    re: /\bunderscore(s|d)?\b/i,
    note: "English LLM verb: underscore",
  },
  {
    id: "en-tapestry",
    severity: "high",
    lang: "en",
    re: /\btapestry\b/i,
    note: "English LLM metaphor: tapestry",
  },
  {
    id: "en-realm",
    severity: "medium",
    lang: "en",
    re: /\bin the realm of\b/i,
    note: "English LLM: in the realm of",
  },
];

const SOURCE_GLOBS_DIRS = [
  join(rootDir, "src/content"),
  join(rootDir, "src/config"),
  join(rootDir, "src/components"),
  join(rootDir, "src/pages"),
];

const SOURCE_EXTS = new Set([".md", ".mdx", ".ts", ".astro"]);

function walkFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, files);
    else {
      const ext = name.slice(name.lastIndexOf("."));
      if (SOURCE_EXTS.has(ext)) files.push(full);
    }
  }
  return files;
}

function walkHtml(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkHtml(full, files);
    else if (name === "index.html" || name.endsWith(".html")) files.push(full);
  }
  return files;
}

function htmlToRoute(file: string): string {
  const rel = relative(distDir, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  return `/${rel.replace(/\/index\.html$/, "/").replace(/\.html$/, "")}`;
}

function stripNoise(text: string, file: string): string {
  let t = text;
  if (file.endsWith(".astro") || file.endsWith(".html")) {
    t = t.replace(/<script[\s\S]*?<\/script>/gi, " ");
    t = t.replace(/<style[\s\S]*?<\/style>/gi, " ");
    t = t.replace(/\{[\s\S]*?\}/g, (m) => (m.length > 200 ? " " : m));
  }
  if (file.endsWith(".ts")) {
    // Keep string literals roughly by not stripping — scan full file; false positives OK in report
  }
  if (file.endsWith(".md") || file.endsWith(".mdx")) {
    t = t.replace(/^---[\s\S]*?---\n/, "\n");
    t = t.replace(/```[\s\S]*?```/g, " ");
  }
  return t;
}

function scanFile(file: string): Finding[] {
  const raw = readFileSync(file, "utf8");
  const text = stripNoise(raw, file);
  const lines = text.split(/\n/);
  const findings: Finding[] = [];
  const rel = relative(rootDir, file);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip pure imports / URLs-only lines
    if (/^\s*(import|export)\s/.test(line)) continue;
    if (/^\s*\/\//.test(line) && line.length < 120) continue;

    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      const m = line.match(rule.re);
      if (!m) continue;
      findings.push({
        file: rel,
        line: i + 1,
        rule: rule.id,
        severity: rule.severity,
        lang: rule.lang,
        match: m[0].slice(0, 80),
        context: line.trim().slice(0, 160),
      });
    }
  }
  return findings;
}

function inventoryPages(): PageEntry[] {
  const pages: PageEntry[] = [];
  if (!sourceOnly && existsSync(distDir)) {
    for (const html of walkHtml(distDir)) {
      pages.push({ path: htmlToRoute(html), kind: "html" });
    }
  }
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

function inventorySources(): string[] {
  const files: string[] = [];
  for (const dir of SOURCE_GLOBS_DIRS) walkFiles(dir, files);
  return files.sort();
}

function summarize(findings: Finding[]) {
  const byRule = new Map<string, number>();
  const byFile = new Map<string, number>();
  const bySeverity = { high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);
    byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
    bySeverity[f.severity] += 1;
  }
  return { byRule, byFile, bySeverity };
}

function renderMarkdown(pages: PageEntry[], sources: string[], findings: Finding[]): string {
  const { byRule, byFile, bySeverity } = summarize(findings);
  const topFiles = [...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
  const topRules = [...byRule.entries()].sort((a, b) => b[1] - a[1]);

  const high = findings.filter((f) => f.severity === "high").slice(0, 80);

  const pageList = pages
    .filter((p) => !p.path.includes("404") && !p.path.includes("open-graph"))
    .slice(0, 300);

  return `# Audit voix anti-IA (FR / EN)

**Date :** ${new Date().toISOString().slice(0, 10)}  
**Sources scannées :** ${sources.length} fichiers  
**Pages HTML (dist) :** ${pages.length}  
**Findings :** ${findings.length} (high ${bySeverity.high} / medium ${bySeverity.medium} / low ${bySeverity.low})

## Méthode

Heuristiques lexicales (tirets cadratin, amorces méta, buzzwords FR/EN).  
Ce n’est **pas** un juge stylistique absolu : chaque hit high/medium doit être relu humainement.

Relancer :

\`\`\`bash
bun run audit:ai-voice
\`\`\`

## Pages prioritaires (relecture FR/EN)

Ordre : home → start-here → about → thinking → work → projects → speaking → contact.

${PRIORITY_ROUTES.map((path) => `- [ ] \`${path}\``).join("\n")}

## Top règles

| Règle | Hits |
| ----- | ---- |
${topRules.map(([r, n]) => `| \`${r}\` | ${n} |`).join("\n")}

## Top fichiers

| Fichier | Hits |
| ------- | ---- |
${topFiles.map(([f, n]) => `| \`${f}\` | ${n} |`).join("\n")}

## Hits high (échantillon)

${
  high.length === 0
    ? "_Aucun hit high._"
    : high
        .map(
          (f) =>
            `- \`${f.file}:${f.line}\` **${f.rule}** (${f.lang}) — \`${f.match}\`\n  > ${f.context}`
        )
        .join("\n")
}

## Inventaire pages (dist)

${
  pageList.length === 0
    ? "_Pas de dist/ — lancer `bun run build` puis relancer l’audit._"
    : pageList.map((p) => `- \`${p.path}\``).join("\n")
}

## Checklist relecture humaine

Pour chaque page FR/EN prioritaire (home, start-here, about, work, thinking index, speaking, contact) :

1. Lire à voix haute 20 secondes : est-ce que ça sonne **parlé** ou **généré** ?
2. Supprimer tirets cadratin et transitions creuses.
3. Garder le jugement concret (contrainte → décision → preuve).
`;
}

function main() {
  const pages = inventoryPages();
  const sources = inventorySources();
  const findings: Finding[] = [];
  for (const file of sources) {
    findings.push(...scanFile(file));
  }

  // Also scan visible text from built HTML if available
  if (!sourceOnly && existsSync(distDir)) {
    for (const html of walkHtml(distDir)) {
      findings.push(...scanFile(html));
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    sourceCount: sources.length,
    findingCount: findings.length,
    pages: pages.map((p) => p.path),
    summary: summarize(findings),
    findings,
  };

  // Convert Maps for JSON
  const jsonReport = {
    ...report,
    summary: {
      bySeverity: report.summary.bySeverity,
      byRule: Object.fromEntries(report.summary.byRule),
      byFile: Object.fromEntries(
        [...report.summary.byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80)
      ),
    },
  };

  writeFileSync(docsOut, renderMarkdown(pages, sources, findings), "utf8");

  const worklogDir = join(homedir(), "Worklog/content/rewrites");
  if (existsSync(join(homedir(), "Worklog"))) {
    mkdirSync(worklogDir, { recursive: true });
    writeFileSync(
      join(worklogDir, "ai-voice-audit.json"),
      `${JSON.stringify(jsonReport, null, 2)}\n`,
      "utf8"
    );
  }

  if (jsonOnly) {
    console.log(JSON.stringify(jsonReport.summary, null, 2));
  } else {
    console.log(`Pages (dist): ${pages.length}`);
    console.log(`Sources:     ${sources.length}`);
    console.log(
      `Findings:    ${findings.length} (high ${report.summary.bySeverity.high} / medium ${report.summary.bySeverity.medium} / low ${report.summary.bySeverity.low})`
    );
    console.log(`Report:      ${relative(rootDir, docsOut)}`);
    const top = [...report.summary.byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    console.log("\nTop files:");
    for (const [f, n] of top) console.log(`  ${n.toString().padStart(3)}  ${f}`);
  }
}

main();
