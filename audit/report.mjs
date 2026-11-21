import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = "reports/modern-web-guidance";
const readJson = (filename) => JSON.parse(readFileSync(filename, "utf8"));
const scan = readJson(join(root, "legacy-scan.json"));
const browserDir = "audit-results/browser";
const browsers = existsSync(browserDir)
  ? readdirSync(browserDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => readJson(join(browserDir, name)))
  : [];

function findJsonFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findJsonFiles(path);
    return entry.name.endsWith(".json") ? [path] : [];
  });
}

const lighthouse = [];
for (const file of findJsonFiles("audit-results/lighthouse")) {
  try {
    const result = readJson(file);
    if (!result.categories?.performance || !result.audits) continue;
    lighthouse.push({
      url: new URL(result.finalUrl ?? result.requestedUrl).pathname,
      performance: result.categories.performance.score,
      accessibility: result.categories.accessibility?.score ?? null,
      bestPractices: result.categories["best-practices"]?.score ?? null,
      seo: result.categories.seo?.score ?? null,
      lcpMs: result.audits["largest-contentful-paint"]?.numericValue ?? null,
      cls: result.audits["cumulative-layout-shift"]?.numericValue ?? null,
      tbtMs: result.audits["total-blocking-time"]?.numericValue ?? null,
    });
  } catch (error) {
    console.warn("Cannot read Lighthouse report: " + file + " " + String(error));
  }
}

const headers = [
  "content-security-policy",
  "strict-transport-security",
  "permissions-policy",
  "referrer-policy",
  "x-content-type-options",
  "cross-origin-opener-policy",
];
let publicHeaders;
try {
  const response = await fetch("https://etienne.deneuve.xyz/", {
    method: "HEAD",
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  publicHeaders = {
    status: response.status,
    url: response.url,
    headers: Object.fromEntries(headers.map((name) => [name, response.headers.get(name)])),
  };
} catch (error) {
  publicHeaders = { error: String(error), status: null, headers: {} };
}

const byRule = new Map();
for (const page of browsers) {
  for (const violation of page.axe?.violations ?? []) {
    const key = violation.id;
    const data = byRule.get(key) ?? {
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      occurrences: 0,
      pages: new Set(),
    };
    data.occurrences++;
    data.pages.add(page.route + " @ " + page.browser);
    byRule.set(key, data);
  }
}
const axeRules = [...byRule.values()].map((value) => ({
  id: value.id,
  impact: value.impact,
  help: value.help,
  occurrences: value.occurrences,
  pages: [...value.pages],
}));

const report = {
  metadata: {
    repository: process.env.GITHUB_REPOSITORY,
    sha: process.env.GITHUB_SHA,
    run: process.env.GITHUB_RUN_ID,
    cadence: "monthly or manual",
    axeCorePlaywright: "4.14.0",
    modernWebGuidance: "1.0.1",
  },
  staticScan: {
    totalFindings: scan.totalFindings,
    guideCount: scan.guides?.length ?? 0,
    coverageNote: "Only deterministic legacy rules (~20% of guidance); not full compliance.",
  },
  browserAudit: {
    sampledPages: browsers.length,
    axeRuleTypes: axeRules,
    pageIssues: browsers
      .filter(
        (page) =>
          page.status >= 400 ||
          page.status < 200 ||
          page.document?.horizontalOverflow ||
          !page.document?.hasMain ||
          page.pageErrors.length > 0
      )
      .map((page) => ({
        route: page.route,
        browser: page.browser,
        status: page.status,
        horizontalOverflow: page.document?.horizontalOverflow,
        hasMain: page.document?.hasMain,
        pageErrors: page.pageErrors,
      })),
  },
  lighthouse,
  publicHeaders,
  manualReview: [
    "Nav.astro — responsive navbar, keyboard focus, popover API and fallbacks",
    "ArticleTableOfContents.astro — scrollspy, scroll anchoring and screen readers",
    "UnchairLanding.astro — hero LCP, image dimensions, motion reduction",
    "MainHead.astro / ThemeToggle.astro — theme initialization, contrast and color scheme",
    "External resources — privacy, consent, headers, requests",
  ],
  limitations: [
    "Axe cannot detect every accessibility failure; manual screen-reader review required.",
    "Lighthouse lab LCP/CLS/TBT are not field INP or p75 Core Web Vitals.",
    "HEAD response headers are observational, not a security penetration test.",
    "Browser tests sample routes and states rather than exhaustively exploring the site.",
    "Human must verify findings and deduplicate existing issues before opening new ones.",
  ],
};

mkdirSync(root, { recursive: true });
writeFileSync(join(root, "monthly-audit.json"), JSON.stringify(report, null, 2) + "\n");

const lines = [
  "# Monthly Modern Web Audit — Étienne",
  "",
  "| Area | Evidence |",
  "| --- | --- |",
  "| Legacy patterns | " + scan.totalFindings + " provisional matches |",
  "| Browser sampling | " + browsers.length + " route/browser combinations |",
  "| Axe rules | " + axeRules.length + " unique violation types (not yet confirmed defects) |",
  "| Lighthouse | " + lighthouse.length + " page report(s), lab only |",
  "| Production HTTP headers | " + (publicHeaders.status ?? "request unavailable") + " |",
  "",
  "## Browser and accessibility candidates",
  "",
];
if (!axeRules.length) lines.push("No automated WCAG-tagged rule violations found in this sample.");
for (const rule of axeRules) {
  lines.push(
    "- **" +
      rule.id +
      "** (" +
      rule.impact +
      "): " +
      rule.occurrences +
      " sampled route/browser combinations — " +
      rule.help
  );
}
if (report.browserAudit.pageIssues.length) {
  lines.push("", "## Browser route/runtime observations", "");
  for (const issue of report.browserAudit.pageIssues) {
    lines.push(
      "- " +
        issue.route +
        " / " +
        issue.browser +
        ": status " +
        issue.status +
        ", overflow=" +
        issue.horizontalOverflow +
        ", hasMain=" +
        issue.hasMain +
        ", pageErrors=" +
        issue.pageErrors.length
    );
  }
}
lines.push("", "## Lighthouse lab measurements", "");
lines.push("| Route | Performance | LCP (ms) | CLS | TBT (ms) |");
lines.push("| --- | ---: | ---: | ---: | ---: |");
for (const page of lighthouse) {
  lines.push(
    "| " +
      page.url +
      " | " +
      (page.performance ?? "?") +
      " | " +
      Math.round(page.lcpMs ?? 0) +
      " | " +
      (page.cls ?? "?") +
      " | " +
      Math.round(page.tbtMs ?? 0) +
      " |"
  );
}
lines.push("", "## Passive production response-header observation", "");
for (const name of headers) {
  lines.push("- " + name + ": " + (publicHeaders.headers[name] ? "present" : "not observed"));
}
lines.push(
  "",
  "## Human Modern Web Guidance review queue",
  "",
  ...report.manualReview.map((item) => "- [ ] " + item),
  "",
  "**Important:** Findings require KEEP / DROP / FALLBACK triage. No automatic issue creation.",
  "Only the documented subset of guidance is machine-checkable; not a certification.",
  ""
);
const summary = lines.join("\n");
writeFileSync(join(root, "monthly-audit.md"), summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
console.log(
  JSON.stringify({
    legacy: scan.totalFindings,
    sampledPages: browsers.length,
    axeRuleTypes: axeRules.length,
    lighthouseReports: lighthouse.length,
    headerProbeStatus: publicHeaders.status,
  })
);
