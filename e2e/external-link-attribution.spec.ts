import { expect, test } from "@playwright/test";

const SOURCE = "etienne.deneuve.xyz";

test.describe("external link attribution", () => {
  test("adds the source while preserving query parameters and fragments", async ({ page }) => {
    await page.goto("/thinking/2017-01-26-utiliser-ansible-et-azure-oui-cest-possible/");

    const bing = new URL(await page.getByRole("link", { name: "Bing" }).getAttribute("href"));
    expect(bing.searchParams.get("q")).toBe("tutorial installation ansible");
    expect(bing.searchParams.get("utm_source")).toBe(SOURCE);

    await page.goto("/thinking/2026-07-06-observabilite-contrat-testable/");
    const prometheus = new URL(
      await page
        .locator('a[href*="prometheus.io/docs/prometheus/latest/querying/api/"]')
        .getAttribute("href")
    );
    expect(prometheus.hash).toBe("#rules");
    expect(prometheus.searchParams.get("utm_source")).toBe(SOURCE);
  });

  test("does not alter internal or non-HTTP links", async ({ page }) => {
    await page.goto("/thinking/2026-07-06-observabilite-contrat-testable/");

    const internal = page.getByRole("link", { name: /Thinking/ }).first();
    expect(
      new URL(await internal.getAttribute("href"), page.url()).searchParams.has("utm_source")
    ).toBe(false);

    await page.evaluate(() => {
      document.body.insertAdjacentHTML(
        "beforeend",
        '<a id="mail-link" href="mailto:hello@example.com">Email</a>'
      );
    });
    await expect(page.locator("#mail-link")).toHaveAttribute("href", "mailto:hello@example.com");
  });

  test("covers dynamically inserted links and overrides stale attribution", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.body.insertAdjacentHTML(
        "beforeend",
        '<a id="dynamic-link" href="https://example.com/resource?utm_source=old#section">Resource</a>'
      );
    });

    await expect
      .poll(async () =>
        new URL(await page.locator("#dynamic-link").getAttribute("href")).searchParams.get(
          "utm_source"
        )
      )
      .toBe(SOURCE);
    expect(new URL(await page.locator("#dynamic-link").getAttribute("href")).hash).toBe("#section");
  });

  test("leaves signed and explicitly excluded URLs unchanged", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.body.insertAdjacentHTML(
        "beforeend",
        [
          '<a id="signed-link" href="https://storage.example.com/file?X-Amz-Signature=abc">Signed</a>',
          '<a id="excluded-link" href="https://example.com/private" data-no-utm>Excluded</a>',
        ].join("")
      );
    });

    await expect(page.locator("#signed-link")).not.toHaveAttribute("href", /utm_source/);
    await expect(page.locator("#excluded-link")).toHaveAttribute(
      "href",
      "https://example.com/private"
    );
  });
});
