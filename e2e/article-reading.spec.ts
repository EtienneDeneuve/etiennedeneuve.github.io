import { expect, test, type Page } from "@playwright/test";

const ARTICLE_A = "/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/";
const ARTICLE_B = "/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre/";

async function collectPageErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(String(error));
  });
  return errors;
}

async function expectReadingChrome(page: Page) {
  await expect(page.locator("[data-article-root]")).toBeVisible();
  await expect(page.locator("[data-article-progress]")).toBeVisible();
  await expect(page.locator("[data-toc]")).toBeVisible();
  const offset = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--site-nav-offset").trim()
  );
  expect(offset.length).toBeGreaterThan(0);
}

test.describe("article reading UI (ClientRouter lifecycle)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("A → B → back A → section → scroll → hard refresh keeps chrome and spy", async ({
    page,
  }) => {
    const errors = await collectPageErrors(page);

    await page.goto(ARTICLE_A, { waitUntil: "networkidle" });
    await expectReadingChrome(page);
    await expect(page.locator("h1")).toContainText(/provisioning Mac/i);
    await expect(page.locator("[data-article-cta-sticky]")).toHaveCount(0);
    await expect(page.locator(".article-byline")).toContainText(/CTO expert/i);
    await expect(page.locator(".article-cta__bridge")).toContainText(/Omnivya/i);
    await expect(page.locator(".article-cta__aside a[href='/contact/']")).toBeVisible();

    // Soft navigations through ClientRouter (clicks, not page.goto between articles).
    await page.locator('a[href="/thinking/"]').first().click();
    await expect(page).toHaveURL(/\/thinking\/$/);
    await page.locator(`a[href="${ARTICLE_B}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(ARTICLE_B.replace(/\//g, "\\/")));
    await expectReadingChrome(page);
    await expect(page.locator("h1")).toContainText(/CI/i);

    await page.locator('a[href="/thinking/"]').first().click();
    await expect(page).toHaveURL(/\/thinking\/$/);
    await page.locator(`a[href="${ARTICLE_A}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(ARTICLE_A.replace(/\//g, "\\/")));
    await expectReadingChrome(page);
    await expect(page.locator("h1")).toContainText(/provisioning Mac/i);

    const tocLinks = page.locator("[data-toc] [data-toc-link]");
    const linkCount = await tocLinks.count();
    expect(linkCount).toBeGreaterThan(1);

    const second = tocLinks.nth(1);
    const sectionId = await second.getAttribute("data-toc-link");
    expect(sectionId).toBeTruthy();

    await second.click();
    await expect
      .poll(async () => decodeURIComponent(new URL(page.url()).hash.slice(1)))
      .toBe(sectionId);
    await expect(second).toHaveClass(/is-active/);
    await expect(second).toHaveAttribute("aria-current", "true");

    const heading = page.locator(`[id="${sectionId}"]`);
    await expect(heading).toBeVisible();
    const headingTop = await heading.evaluate((el) => el.getBoundingClientRect().top);
    const navOffset = await page.evaluate(() =>
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--site-nav-offset")
      )
    );
    expect(headingTop).toBeLessThan(navOffset + 80);

    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(200);

    const progressNow = await page.locator("[data-article-progress]").getAttribute("aria-valuenow");
    expect(Number(progressNow)).toBeGreaterThan(0);

    await expect(page.locator("[data-article-top]")).toBeVisible();
    await page.locator("[data-article-top]").click({ force: true });
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 3000 })
      .toBeLessThan(80);

    // Hard refresh must re-bind without stacking handlers or throwing.
    await page.reload({ waitUntil: "networkidle" });
    await expectReadingChrome(page);
    await page.evaluate(() => window.scrollBy(0, 1600));
    await page.waitForTimeout(200);
    const progressAfterReload = await page
      .locator("[data-article-progress]")
      .getAttribute("aria-valuenow");
    expect(Number(progressAfterReload)).toBeGreaterThan(0);

    const activeAfterScroll = page.locator("[data-toc] [data-toc-link].is-active");
    await expect(activeAfterScroll).toHaveCount(1);

    expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("mobile quick-nav + keyboard focus on TOC and top control", async ({ page }) => {
    const errors = await collectPageErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ARTICLE_A, { waitUntil: "networkidle" });

    const panel = page.locator("[data-toc] .toc__panel");
    await expect(panel).toBeVisible();
    // syncTocOpen collapses the panel below 64em; toggle via summary (keyboard-friendly).
    await expect
      .poll(async () => panel.evaluate((el) => (el as HTMLDetailsElement).open))
      .toBe(false);
    await page.locator("[data-toc] .toc__summary").click();
    await expect
      .poll(async () => panel.evaluate((el) => (el as HTMLDetailsElement).open))
      .toBe(true);

    const firstLink = page.locator("[data-toc] [data-toc-link]").first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(150);
    const topBtn = page.locator("[data-article-top]");
    await expect(topBtn).toBeVisible();
    await topBtn.focus();
    await expect(topBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 2000 })
      .toBeLessThan(80);

    expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("prefers-reduced-motion uses instant scroll for top control", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(ARTICLE_A, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(100);
    await page.locator("[data-article-top]").click();
    // auto behavior should land immediately (no long smooth tween).
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 500 })
      .toBeLessThan(40);
  });
});
