import { expect, test } from "@playwright/test";

/**
 * The library index is statically built, so its GET filter form cannot be
 * resolved server-side. These tests pin the client-side fallback that keeps
 * shared filter URLs meaningful.
 */
test.describe("/thinking/ filters", () => {
  test("unfiltered library lists every article", async ({ page }) => {
    await page.goto("/thinking/");
    const cards = page.locator("[data-library-grid] > article");
    const total = await cards.count();
    expect(total).toBeGreaterThan(10);
    await expect(cards.filter({ visible: true })).toHaveCount(total);
    await expect(page.locator("[data-library-empty]")).toBeHidden();
  });

  test("a content-type filter narrows the library and updates the count", async ({ page }) => {
    await page.goto("/thinking/?type=doctrine");

    const visible = page.locator("[data-library-grid] > article:visible");
    await expect(visible).not.toHaveCount(0);

    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute("data-type", "doctrine");
    }

    const count = page.locator("[data-library-count]");
    await expect(count).toHaveText(String(await visible.count()));
    await expect(page.locator("[data-featured-section]")).toBeHidden();
  });

  test("a pillar filter only keeps articles of that pillar", async ({ page }) => {
    await page.goto("/thinking/?pillar=observability");

    const visible = page.locator("[data-library-grid] > article:visible");
    await expect(visible).not.toHaveCount(0);

    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute("data-pillar", "observability");
    }
  });

  test("an unmatched filter combination surfaces the empty state", async ({ page }) => {
    await page.goto("/thinking/?pillar=observability&type=opinion");

    await expect(page.locator("[data-library-grid] > article:visible")).toHaveCount(0);
    await expect(page.locator("[data-library-empty]")).toBeVisible();
    await expect(page.locator("[data-library-count]")).toHaveText("0");
  });

  test("sorting by oldest reorders the library", async ({ page }) => {
    await page.goto("/thinking/?sort=oldest");

    const dates = await page
      .locator("[data-library-grid] > article:visible")
      .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.date ?? ""));

    expect(dates.length).toBeGreaterThan(1);
    expect(dates).toEqual([...dates].sort());
  });
  test("query parameters are reflected in visible form selections", async ({ page }) => {
    await page.goto("/thinking/?pillar=observability&sort=oldest");
    await expect(page.locator('select[name="pillar"]')).toHaveValue("observability");
    await expect(page.locator('select[name="sort"]')).toHaveValue("oldest");

    const cards = page.locator("[data-library-grid] > article:visible");
    await expect(cards).not.toHaveCount(0);
    for (const card of await cards.all()) {
      await expect(card).toHaveAttribute("data-pillar", "observability");
    }
  });

  test("changing a filter updates the static library without another navigation", async ({ page }) => {
    await page.goto("/thinking/");
    const allCards = page.locator("[data-library-grid] > article");
    const originalTitles = await allCards.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).dataset.title ?? "")
    );

    await page.locator('select[name="pillar"]').selectOption("observability");
    await expect(page).toHaveURL(/pillar=observability/);
    const visible = page.locator("[data-library-grid] > article:visible");
    await expect(visible).not.toHaveCount(0);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute("data-pillar", "observability");
    }
    await expect(page.locator("[data-library-count]")).toHaveText(
      String(await visible.count())
    );

    // Changing sort twice must restore the original featured order.
    await page.locator('select[name="pillar"]').selectOption("");
    await page.locator('select[name="sort"]').selectOption("oldest");
    const ascendingDates = await allCards.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).dataset.date ?? "")
    );
    expect(ascendingDates).toEqual([...ascendingDates].sort());

    await page.locator('select[name="sort"]').selectOption("featured");
    const restoredTitles = await allCards.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).dataset.title ?? "")
    );
    expect(restoredTitles).toEqual(originalTitles);
    await expect(page).toHaveURL("/thinking/");
  });

});
