import { expect, test, type Page } from "@playwright/test";

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
  });
  expect(overflow.scrollWidth, "horizontal overflow").toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function assertPortraitReserved(page: Page) {
  const img = page.locator(".home-portrait img");
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("width", "280");
  await expect(img).toHaveAttribute("height", "280");
  await expect(img).toHaveAttribute("src", /portrait-cto-conseil/);

  const box = await img.boundingBox();
  expect(box).toBeTruthy();
  if (!box) return;
  // Square reserved box — tolerate sub-pixel rounding.
  expect(Math.abs(box.width - box.height)).toBeLessThan(2);
  expect(box.width).toBeGreaterThan(80);
}

async function assertHeroCta(page: Page, lang: "fr" | "en") {
  const cta = page.locator("a.home-cta");
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute("href");
  expect(href).toBeTruthy();
  const url = new URL(href!);
  expect(url.hostname).toMatch(/omnivya\.fr$/);
  expect(url.pathname).toMatch(lang === "fr" ? /\/fr\/contact\/?/ : /\/contact\/?/);
  expect(url.searchParams.get("utm_source")).toBe("etienne_deneuve");
  expect(url.searchParams.get("utm_medium")).toBe("referral");
  expect(url.searchParams.get("utm_campaign")).toBe("site");
  expect(url.searchParams.get("utm_content")).toBe("home-hero");

  // Title + CTA not truncated into zero-height / overflow-hidden collapse.
  const title = page.locator("#home-title");
  await expect(title).toBeVisible();
  const titleBox = await title.boundingBox();
  const ctaBox = await cta.boundingBox();
  expect(titleBox?.height ?? 0).toBeGreaterThan(24);
  expect(ctaBox?.height ?? 0).toBeGreaterThan(24);
}

test.describe("home hero reception (#171)", () => {
  for (const { path, lang } of [
    { path: "/", lang: "fr" as const },
    { path: "/en/", lang: "en" as const },
  ]) {
    test(`portrait + CTA + lang on ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await assertPortraitReserved(page);
      await assertHeroCta(page, lang);
      await expect(page.locator(".home-cta")).toContainText(
        lang === "fr" ? /Échanger|enjeux/i : /Discuss|stakes/i
      );
    });
  }

  test("no H-scroll / no layout shift flags at key widths", async ({ page }) => {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 900 ? 844 : 900 });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await assertNoHorizontalOverflow(page);
      await assertPortraitReserved(page);
      await assertHeroCta(page, "fr");
    }
  });

  test("CTA focus-visible and theme toggle keep hero usable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const cta = page.locator("a.home-cta");
    await cta.focus();
    await expect(cta).toBeFocused();

    const themeBtn = page.locator(".site-nav theme-toggle button");
    await themeBtn.click();
    await expect(page.locator("html")).toHaveClass(/theme-dark/);
    await assertPortraitReserved(page);
    await expect(cta).toBeVisible();

    await themeBtn.click();
    await expect(cta).toBeVisible();
    await cta.focus();
    await expect(cta).toBeFocused();
  });
});
