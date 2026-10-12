import { expect, test, type Page } from "@playwright/test";

/**
 * /thinking/ is statically built for GitHub Pages. Filters must run in the
 * browser against data-* rows — Astro.url.searchParams is empty at generate.
 */
async function visibleLibrary(page: Page) {
  return page.locator("[data-library-grid] > article:visible");
}

async function openFilters(page: Page) {
  const panel = page.locator("details.thinking-filters-panel");
  if (!(await panel.getAttribute("open"))) {
    await panel.locator("summary").click();
  }
}

test.describe("/thinking/ filters (built site)", () => {
  test("unfiltered library lists locale articles and keeps opening shelf", async ({ page }) => {
    await page.goto("/thinking/");
    const cards = await visibleLibrary(page);
    const total = await cards.count();
    expect(total).toBeGreaterThan(12);
    await expect(page.locator("[data-library-empty]")).toBeHidden();
    await expect(page.locator("[data-opening-section]")).toBeVisible();
    await expect(page.locator("[data-library-count]")).toHaveText(String(total));

    // Opening rows stay in the DOM but stay hidden while the shelf is shown.
    const openingHidden = page.locator('[data-library-grid] > article[data-opening="true"]');
    await expect(openingHidden.first()).toBeHidden();
  });

  test("lang=all reveals both languages", async ({ page }) => {
    await page.goto("/thinking/");
    const frOnly = await (await visibleLibrary(page)).count();

    await page.goto("/thinking/?lang=all");
    const allLang = await visibleLibrary(page);
    const allCount = await allLang.count();
    expect(allCount).toBeGreaterThan(frOnly);

    const langs = await allLang.evaluateAll((nodes) => [
      ...new Set(nodes.map((node) => (node as HTMLElement).dataset.lang)),
    ]);
    expect(langs.sort()).toEqual(["en", "fr"]);
    await expect(page.locator("[data-opening-section]")).toBeHidden();
  });

  test("active filters keep opening articles inside the library", async ({ page }) => {
    await page.goto("/thinking/");
    const openingTitles = await page
      .locator("[data-library-grid] > article[data-opening='true']")
      .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.title ?? ""));
    expect(openingTitles.length).toBeGreaterThan(0);

    await page.goto("/thinking/?lang=all");
    for (const title of openingTitles) {
      const row = page.locator(
        `[data-library-grid] > article[data-opening='true'][data-title="${title}"]`
      );
      await expect(row).toBeVisible();
    }
  });

  test("content-type filter narrows results and updates the count", async ({ page }) => {
    await page.goto("/thinking/?type=architecture-decision");

    const visible = await visibleLibrary(page);
    const count = await visible.count();
    expect(count).toBeGreaterThan(0);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute("data-type", "architecture-decision");
    }
    await expect(page.locator("[data-library-count]")).toHaveText(String(count));
    await expect(page.locator("[data-opening-section]")).toBeHidden();
  });

  test("pillar filter only keeps matching articles", async ({ page }) => {
    await page.goto("/thinking/?pillar=observability");

    const visible = await visibleLibrary(page);
    await expect(visible).not.toHaveCount(0);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute("data-pillar", "observability");
    }
  });

  test("empty filter combination shows the empty state (0 results)", async ({ page }) => {
    await page.goto("/thinking/?pillar=observability&type=opinion");

    await expect(await visibleLibrary(page)).toHaveCount(0);
    await expect(page.locator("[data-library-empty]")).toBeVisible();
    await expect(page.locator("[data-library-count]")).toHaveText("0");
  });

  test("filtered library covers exact bands: 1, 3, 5 and 12+ results", async ({ page }) => {
    await page.goto("/thinking/?lang=all");

    const inventory = await page.locator("[data-library-grid] > article").evaluateAll((nodes) =>
      nodes.map((node) => {
        const el = node as HTMLElement;
        return {
          type: el.dataset.type ?? "",
          pillar: el.dataset.pillar ?? "",
          lang: el.dataset.lang ?? "",
          tags: (el.dataset.tags ?? "").split(" ").filter(Boolean),
        };
      })
    );

    const countFor = (predicate: (row: (typeof inventory)[number]) => boolean) =>
      inventory.filter(predicate).length;

    const candidates: Array<{ query: string; want: number }> = [];
    const tryFacet = (
      query: string,
      predicate: (row: (typeof inventory)[number]) => boolean,
      want: number
    ) => {
      if (countFor(predicate) === want) candidates.push({ query, want });
    };

    const types = [...new Set(inventory.map((row) => row.type))];
    const pillars = [...new Set(inventory.map((row) => row.pillar))];
    const tags = [...new Set(inventory.flatMap((row) => row.tags))];
    const langs = [...new Set(inventory.map((row) => row.lang))];

    for (const type of types) {
      tryFacet(`type=${type}`, (row) => row.type === type, 1);
      tryFacet(`type=${type}`, (row) => row.type === type, 3);
      tryFacet(`type=${type}`, (row) => row.type === type, 5);
    }
    for (const pillar of pillars) {
      tryFacet(`pillar=${pillar}`, (row) => row.pillar === pillar, 1);
      tryFacet(`pillar=${pillar}`, (row) => row.pillar === pillar, 3);
      tryFacet(`pillar=${pillar}`, (row) => row.pillar === pillar, 5);
    }
    for (const tag of tags) {
      tryFacet(`tag=${tag}`, (row) => row.tags.includes(tag), 1);
      tryFacet(`tag=${tag}`, (row) => row.tags.includes(tag), 3);
      tryFacet(`tag=${tag}`, (row) => row.tags.includes(tag), 5);
    }
    for (const pillar of pillars) {
      for (const type of types) {
        tryFacet(
          `pillar=${pillar}&type=${type}`,
          (row) => row.pillar === pillar && row.type === type,
          1
        );
        tryFacet(
          `pillar=${pillar}&type=${type}`,
          (row) => row.pillar === pillar && row.type === type,
          3
        );
        tryFacet(
          `pillar=${pillar}&type=${type}`,
          (row) => row.pillar === pillar && row.type === type,
          5
        );
      }
    }
    for (const lang of langs) {
      for (const pillar of pillars) {
        tryFacet(
          `lang=${lang}&pillar=${pillar}`,
          (row) => row.lang === lang && row.pillar === pillar,
          1
        );
        tryFacet(
          `lang=${lang}&pillar=${pillar}`,
          (row) => row.lang === lang && row.pillar === pillar,
          3
        );
        tryFacet(
          `lang=${lang}&pillar=${pillar}`,
          (row) => row.lang === lang && row.pillar === pillar,
          5
        );
      }
    }

    const pick = (want: number) => candidates.find((item) => item.want === want);
    const one = pick(1);
    const three = pick(3);
    const five = pick(5);
    expect(one, "need a facet with exactly 1 result").toBeTruthy();
    expect(three, "need a facet with exactly 3 results").toBeTruthy();
    expect(five, "need a facet with exactly 5 results").toBeTruthy();

    for (const sample of [one!, three!, five!]) {
      const qs = sample.query.includes("lang=") ? sample.query : `lang=all&${sample.query}`;
      await page.goto(`/thinking/?${qs}`);
      await expect(await visibleLibrary(page)).toHaveCount(sample.want);
      await expect(page.locator("[data-library-count]")).toHaveText(String(sample.want));
    }

    await page.goto("/thinking/?lang=all");
    expect(await (await visibleLibrary(page)).count()).toBeGreaterThan(12);
  });

  test("sorting by oldest reorders the library", async ({ page }) => {
    await page.goto("/thinking/?sort=oldest");

    const dates = await (
      await visibleLibrary(page)
    ).evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.date ?? ""));

    expect(dates.length).toBeGreaterThan(1);
    expect(dates).toEqual([...dates].sort());
  });

  test("query parameters sync into form selections", async ({ page }) => {
    await page.goto("/thinking/?pillar=observability&sort=oldest");
    await openFilters(page);
    await expect(page.locator('select[name="pillar"]')).toHaveValue("observability");
    await expect(page.locator('select[name="sort"]')).toHaveValue("oldest");
  });

  test("changing filters updates the library and history without reload", async ({ page }) => {
    await page.goto("/thinking/");
    await openFilters(page);

    await page.locator('select[name="pillar"]').selectOption("observability");
    await expect(page).toHaveURL(/pillar=observability/);
    const filtered = await visibleLibrary(page);
    await expect(filtered).not.toHaveCount(0);
    for (const card of await filtered.all()) {
      await expect(card).toHaveAttribute("data-pillar", "observability");
    }

    await page.locator('select[name="lang"]').selectOption("all");
    await expect(page).toHaveURL(/lang=all/);
    await expect(page).toHaveURL(/pillar=observability/);

    await page.goBack();
    await expect(page).toHaveURL(/pillar=observability/);
    await expect(page).not.toHaveURL(/lang=all/);
    await expect(page.locator('select[name="pillar"]')).toHaveValue("observability");
    await expect(page.locator('select[name="lang"]')).toHaveValue("fr");
  });

  test("EN index defaults to English rows", async ({ page }) => {
    await page.goto("/en/thinking/");
    const visible = await visibleLibrary(page);
    await expect(visible).not.toHaveCount(0);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute("data-lang", "en");
    }
    await openFilters(page);
    await expect(page.locator('select[name="lang"]')).toHaveValue("en");
  });
});
