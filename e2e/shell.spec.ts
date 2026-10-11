import { expect, test, type Page } from "@playwright/test";

const shellRoutes = ["/", "/work/", "/contact/", "/thinking/", "/en/", "/en/work/", "/en/contact/"];

const forbiddenNavLabels = [/start here/i, /commencer ici/i, /case studies/i, /études de cas/i];
const forbiddenLegalLabels = [/mentions utiles/i, /legal notes/i];

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  expect(overflow.scrollWidth, "horizontal overflow").toBeLessThanOrEqual(overflow.clientWidth + 1);
}

test.describe("shared shell reception (#167)", () => {
  for (const path of shellRoutes) {
    test(`nav/footer links clean on ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.ok()).toBeTruthy();

      const nav = page.locator("nav.site-nav");
      const footer = page.locator("footer.site-footer");
      await expect(nav).toBeVisible();
      await expect(footer).toBeVisible();

      const navText = await nav.innerText();
      for (const label of forbiddenNavLabels) {
        expect(navText, `nav must not contain ${label}`).not.toMatch(label);
      }

      const footerText = await footer.innerText();
      for (const label of [...forbiddenNavLabels, ...forbiddenLegalLabels]) {
        expect(footerText, `footer must not contain ${label}`).not.toMatch(label);
      }

      await expect(footer.locator('a[href*="start-here"]')).toHaveCount(0);
      await expect(footer.locator('a[href*="case-studies"]')).toHaveCount(0);
      await expect(nav.locator('a[href*="start-here"]')).toHaveCount(0);

      // Footer is in document flow, not a fixed overlay.
      await expect(footer).not.toHaveCSS("position", "fixed");

      await expect(nav.getByRole("link", { name: /FR|EN/i }).first()).toBeVisible();
      await expect(nav.locator("theme-toggle button")).toBeVisible();
    });
  }

  test("mobile menu Escape returns focus; no H-scroll at key widths", async ({ page }) => {
    const widths = [320, 390, 768, 1024, 1440];
    for (const width of widths) {
      await page.setViewportSize({ width, height: width < 900 ? 844 : 900 });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await assertNoHorizontalOverflow(page);

      if (width < 1200) {
        const menuButton = page.locator(".menu-button");
        await expect(menuButton).toBeVisible();
        await menuButton.click();
        await expect(menuButton).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator("#menu-content")).toBeVisible();

        const focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toBe("A");

        await page.keyboard.press("Escape");
        await expect(menuButton).toHaveAttribute("aria-expanded", "false");
        await expect(menuButton).toBeFocused();
      } else {
        await expect(page.locator(".menu-button")).toBeHidden();
        await expect(page.locator("#menu-content")).toBeVisible();
      }
    }
  });

  test("language switch and theme toggle are keyboard reachable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const langLink = page.locator(".site-nav .lang-switch__link");
    await langLink.focus();
    await expect(langLink).toBeFocused();

    const themeBtn = page.locator(".site-nav theme-toggle button");
    await themeBtn.focus();
    await expect(themeBtn).toBeFocused();
    const before = await page.locator("html").getAttribute("class");
    await themeBtn.press("Enter");
    const after = await page.locator("html").getAttribute("class");
    expect(after).not.toEqual(before);
  });
});
