import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const routes = [
  { path: "/work/", slug: "work-fr", kind: "work" },
  { path: "/en/work/", slug: "work-en", kind: "work" },
  { path: "/projects/", slug: "projects-fr", kind: "projects" },
  { path: "/en/projects/", slug: "projects-en", kind: "projects" },
  { path: "/contact/", slug: "contact-fr", kind: "contact" },
  { path: "/en/contact/", slug: "contact-en", kind: "contact" },
] as const;

const viewports = [
  { label: "mobile-390", width: 390, height: 844 },
  { label: "desktop-1440", width: 1440, height: 900 },
] as const;

test.describe("editorial work, projects and contact pages", () => {
  for (const route of routes) {
    for (const viewport of viewports) {
      test(route.slug + " / " + viewport.label, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        const res = await page.goto(route.path, { waitUntil: "networkidle" });
        expect(res?.status()).toBe(200);

        const main = page.locator("main.editorial-page");
        await expect(main).toBeVisible();
        await expect(main.locator("h1")).toHaveCount(1);
        await expect(main.locator(".ed-hero")).toBeVisible();
        await expect(main.locator(".ed-title__accent")).toBeVisible();

        const darkSurface = await main.locator(".ed-band--dark").first().evaluate(
          (node) => getComputedStyle(node).backgroundColor
        );
        const ivorySurface = await main.locator(".ed-band--light").first().evaluate(
          (node) => getComputedStyle(node).backgroundColor
        );
        expect(darkSurface).toBe("rgb(17, 20, 22)");
        expect(ivorySurface).toBe("rgb(243, 239, 231)");

        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        ).toBeLessThanOrEqual(2);

        if (route.kind === "work") {
          await expect(main.locator(".ed-situation")).toHaveCount(4);
          await expect(main.locator(".ed-steps > li")).toHaveCount(3);
          await expect(main.locator(".ed-actions a[href*='omnivya.fr']")).toHaveCount(1);
        }

        if (route.kind === "projects") {
          await expect(main.locator(".ed-report")).toHaveCount(2);
          expect(await main.locator(".ed-project-grid .project-card").count()).toBeGreaterThan(0);
          await expect(
            main.locator("a[href='/thinking/2026-09-22-opentelemetry-instrumenter-200-services/']")
          ).toHaveCount(1);
        }

        if (route.kind === "contact") {
          await expect(main.locator(".ed-contact-card")).toHaveCount(3);
          await expect(
            main.locator(".ed-contact-card--primary .ed-button")
          ).toHaveAttribute("href", /omnivya\.fr.*utm_source=etienne_deneuve/);
          await expect(main.locator("#speaking a[href^='mailto:']")).toHaveCount(1);
          await expect(main.locator("#conversation a[href*='linkedin.com']")).toHaveCount(1);
        }

        const target = "exports/reception/editorial-pages";
        mkdirSync(target, { recursive: true });
        await page.screenshot({
          path: target + "/" + route.slug + "-" + viewport.label + ".png",
          fullPage: true,
          animations: "disabled",
        });
      });
    }
  }
});
