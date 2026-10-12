import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const pages = [
  { name: "home", path: "/", primary: ".home-band--dark", contrast: ".home-band--light" },
  {
    name: "thinking",
    path: "/thinking/",
    primary: ".thinking-band--dark",
    contrast: ".thinking-band--light",
  },
  {
    name: "article",
    path: "/thinking/2026-09-22-opentelemetry-instrumenter-200-services/",
    primary: ".article",
    contrast: ".article-after",
  },
  { name: "work", path: "/work/", primary: ".ed-band--dark", contrast: ".ed-band--light" },
  { name: "projects", path: "/projects/", primary: ".ed-band--dark", contrast: ".ed-band--light" },
  { name: "contact", path: "/contact/", primary: ".ed-band--dark", contrast: ".ed-band--light" },
] as const;

const widths = [
  { label: "mobile-390", width: 390, height: 844 },
  { label: "desktop-1440", width: 1440, height: 900 },
] as const;

const modes = ["light", "dark"] as const;
const COLOR = { ivory: "rgb(243, 239, 231)", graphite: "rgb(17, 20, 22)" };

test.describe("inverted editorial theme across the site", () => {
  for (const route of pages) {
    for (const mode of modes) {
      for (const viewport of widths) {
        test(`${route.name} / ${mode} / ${viewport.label}`, async ({ page }) => {
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.addInitScript((choice: string) => {
            localStorage.setItem("theme", choice);
          }, mode);
          const response = await page.goto(route.path, { waitUntil: "networkidle" });
          expect(response?.status()).toBe(200);

          const mainColor = mode === "light" ? COLOR.ivory : COLOR.graphite;
          const contrastColor = mode === "light" ? COLOR.graphite : COLOR.ivory;

          const primary = page.locator(route.primary).first();
          const contrast = page.locator(route.contrast).first();
          await expect(primary).toBeVisible();
          await expect(contrast).toBeVisible();
          await expect
            .poll(() => primary.evaluate((el) => getComputedStyle(el).backgroundColor))
            .toBe(mainColor);
          await expect
            .poll(() => contrast.evaluate((el) => getComputedStyle(el).backgroundColor))
            .toBe(contrastColor);
          await expect(page.locator("html")).toHaveCSS("color-scheme", mode);
          await expect(page.locator(".site-footer")).toHaveCSS("background-color", mainColor);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth - document.documentElement.clientWidth
            )
          ).toBeLessThanOrEqual(2);

          const readable = await primary.evaluate((el) => {
            const node = el.querySelector("h1") ?? el.querySelector("h2") ?? el;
            const color = getComputedStyle(node).color;
            const background = getComputedStyle(el).backgroundColor;
            const rgb = (input: string): number[] =>
              [...input.matchAll(/\d+(?:\.\d+)?/g)].slice(0, 3).map((m) => Number(m[0]) / 255);
            const luminance = (input: string): number => {
              const [r, g, b] = rgb(input).map((v) =>
                v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
              );
              return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
            };
            const a = luminance(color);
            const b = luminance(background);
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          });
          expect(readable).toBeGreaterThanOrEqual(4.5);

          await page.evaluate(() => document.fonts.ready);
          const dir = "exports/reception/theme-palette";
          mkdirSync(dir, { recursive: true });
          await page.screenshot({
            path: `${dir}/${route.name}-${mode}-${viewport.label}.png`,
            fullPage: true,
            animations: "disabled",
          });
        });
      }
    }
  }

  test("toggle persists through Astro client navigation and reload", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload();
    await expect(page.locator(".home-band--dark")).toHaveCSS("background-color", COLOR.ivory);
    await page.locator(".site-nav theme-toggle button").click();
    await expect(page.locator("html")).toHaveClass(/theme-dark/);
    await expect(page.locator(".home-band--dark")).toHaveCSS("background-color", COLOR.graphite);

    await page.goto("/thinking/");
    await expect(page.locator("html")).toHaveClass(/theme-dark/);
    await expect(page.locator(".thinking-band--dark")).toHaveCSS(
      "background-color",
      COLOR.graphite
    );
    await page.goto("/contact/");
    await expect(page.locator("html")).toHaveClass(/theme-dark/);
    await expect(page.locator(".ed-band--dark").first()).toHaveCSS(
      "background-color",
      COLOR.graphite
    );

    await page.locator(".site-nav theme-toggle button").click();
    await expect(page.locator(".ed-band--dark").first()).toHaveCSS("background-color", COLOR.ivory);
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/theme-dark/);
  });
});
