import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { test } from "@playwright/test";

// Monthly sampling rather than multiplying the production E2E suite by four browsers.
const routes = [
  "/",
  "/en/",
  "/thinking/",
  "/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/",
  "/contact/",
  "/en/contact/",
  "/unchair/",
  "/en/unchair/",
];

for (const route of routes) {
  test("a11y and browser audit: " + route, async ({ page }, testInfo) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    const response = await page.goto(route, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.locator("body").waitFor({ state: "visible" });

    const findings = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const documentState = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      hasMain: Boolean(document.querySelector("main")),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      width: window.innerWidth,
    }));

    await page.keyboard.press("Tab");
    const focusAfterTab = await page.evaluate(() => ({
      tagName: document.activeElement?.tagName ?? null,
      visible: document.activeElement !== document.body,
    }));

    const report = {
      route,
      browser: testInfo.project.name,
      status: response?.status() ?? 0,
      document: documentState,
      firstTab: focusAfterTab,
      pageErrors,
      axe: {
        violations: findings.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          tags: violation.tags,
          nodes: violation.nodes.slice(0, 10).map((node) => ({
            target: node.target,
            failureSummary: node.failureSummary,
          })),
          nodeCount: violation.nodes.length,
        })),
        incomplete: findings.incomplete.map((item) => ({
          id: item.id,
          impact: item.impact,
          nodeCount: item.nodes.length,
        })),
        passedRules: findings.passes.length,
      },
    };

    mkdirSync("audit-results/browser", { recursive: true });
    const slug = route === "/" ? "home" : route.replaceAll("/", "_").replace(/^_+|_+$/g, "");
    const filename = testInfo.project.name + "-" + slug + ".json";
    writeFileSync(join("audit-results/browser", filename), JSON.stringify(report, null, 2) + "\n");
    await testInfo.attach("browser-a11y-evidence", {
      body: JSON.stringify(report, null, 2),
      contentType: "application/json",
    });
  });
}
