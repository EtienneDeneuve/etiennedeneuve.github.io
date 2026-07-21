import { expect, test } from "@playwright/test";

const criticalPaths = [
  "/",
  "/start-here/",
  "/thinking/",
  "/work/",
  "/projects/",
  "/speaking/",
  "/thinking/2024-10-05-automatisation-carousel-linkedin/",
];

for (const path of criticalPaths) {
  test(`smoke: ${path} renders`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
  });
}

test("home exposes primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nav").first()).toBeVisible();
});
