import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../exports/reception/thinking-ux");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
] as const;

const PAGES = [
  { id: "thinking-index-fr", path: "/thinking/" },
  { id: "thinking-index-en", path: "/en/thinking/" },
  {
    id: "otel-2-fr",
    path: "/thinking/2026-09-22-opentelemetry-instrumenter-200-services/",
  },
  {
    id: "otel-2-en",
    path: "/en/thinking/2026-09-22-opentelemetry-instrumenter-200-services-en/",
  },
  {
    id: "mac-mermaid-fr",
    path: "/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/",
  },
  {
    id: "short-ci-fr",
    path: "/thinking/2026-10-09-ia-accelere-code-ci-doit-suivre/",
  },
  {
    id: "long-otel-fr",
    path: "/thinking/2026-09-22-opentelemetry-exploiter-la-plateforme/",
  },
] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
  });
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

/** Sample key surfaces: fail if text/background luminance contrast is very weak. */
async function assertKeyContrast(page: Page) {
  const issues = await page.evaluate(() => {
    const relLum = (c: string) => {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return null;
      const [r, g, b] = [m[1], m[2], m[3]].map((v) => {
        const n = Number(v) / 255;
        return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const ratio = (fg: string, bg: string) => {
      const L1 = relLum(fg);
      const L2 = relLum(bg);
      if (L1 == null || L2 == null) return null;
      const lighter = Math.max(L1, L2);
      const darker = Math.min(L1, L2);
      return (lighter + 0.05) / (darker + 0.05);
    };
    const pick = (sel: string) => {
      const el = document.querySelector(sel);
      if (!(el instanceof HTMLElement)) return null;
      const cs = getComputedStyle(el);
      let bgEl: HTMLElement | null = el;
      let bg = cs.backgroundColor;
      while (bgEl && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) {
        bgEl = bgEl.parentElement;
        if (!bgEl) break;
        bg = getComputedStyle(bgEl).backgroundColor;
      }
      return { fg: cs.color, bg, text: el.textContent?.slice(0, 40) ?? sel };
    };
    const targets = [
      "main h1",
      ".article-prose .prose p",
      ".thinking-title",
      ".thinking-band--light h2",
      ".article-after p",
    ];
    const bad: string[] = [];
    for (const sel of targets) {
      const sample = pick(sel);
      if (!sample) continue;
      const r = ratio(sample.fg, sample.bg);
      if (r != null && r < 3.5) {
        bad.push(`${sel} contrast ${r.toFixed(2)} (${sample.fg} on ${sample.bg})`);
      }
    }
    return bad;
  });
  expect(issues, issues.join(" | ")).toEqual([]);
}

test.describe("Thinking reception screenshots + finishing checks", () => {
  for (const vp of VIEWPORTS) {
    for (const route of PAGES) {
      test(`${route.id} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const res = await page.goto(route.path, { waitUntil: "networkidle" });
        expect(res?.ok()).toBeTruthy();
        await assertNoHorizontalOverflow(page);
        await assertKeyContrast(page);

        if (
          route.id.includes("otel") ||
          route.id.includes("mac") ||
          route.id.includes("ci") ||
          route.id.includes("long")
        ) {
          await expect(page.locator("[data-article-root]")).toBeVisible();
          const lang = route.path.startsWith("/en/") ? "en" : "fr";
          const expected = lang === "fr" ? /Lien vers cette section/i : /Link to this section/i;
          const anchors = page.locator(".prose a.heading-anchor");
          if ((await anchors.count()) > 0) {
            await expect(anchors.first()).toHaveAttribute("aria-label", expected);
          }
        }

        if (route.id.startsWith("mac-mermaid")) {
          const mermaid = page.locator('.prose svg[id^="mermaid"]').first();
          await expect(mermaid).toBeVisible();
          const box = await mermaid.boundingBox();
          expect(box?.width ?? 0).toBeGreaterThan(40);
          expect(box?.width ?? 0).toBeLessThanOrEqual(vp.width + 1);
        }

        await page.screenshot({
          path: join(OUT, `${route.id}--${vp.name}.png`),
          fullPage: true,
        });
      });
    }
  }

  test("TOC keyboard + touch: anchors clear of sticky chrome @ desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/", {
      waitUntil: "networkidle",
    });

    const tocLinks = page.locator("[data-toc] [data-toc-link]");
    await expect(tocLinks.first()).toBeVisible();
    const sectionId = await tocLinks.nth(1).getAttribute("data-toc-link");
    expect(sectionId).toBeTruthy();
    await tocLinks.nth(1).focus();
    await expect(tocLinks.nth(1)).toBeFocused();
    await page.keyboard.press("Enter");

    const heading = page.locator(`[id="${sectionId}"]`);
    await expect(heading).toBeVisible();
    const navOffset = await page.evaluate(() =>
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--site-nav-offset")
      )
    );
    await expect
      .poll(async () => heading.evaluate((el) => el.getBoundingClientRect().top), {
        timeout: 4000,
      })
      .toBeGreaterThanOrEqual(navOffset - 8);
    await expect
      .poll(async () => heading.evaluate((el) => el.getBoundingClientRect().top), {
        timeout: 4000,
      })
      .toBeLessThan(navOffset + 140);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/", {
      waitUntil: "networkidle",
    });
    await page.locator("[data-toc] .toc__summary").click();
    await page.locator("[data-toc] [data-toc-link]").nth(1).click();
    await page.waitForTimeout(200);
    const mobileTop = await page
      .locator(`[id="${sectionId}"]`)
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(mobileTop).toBeGreaterThan(40);
  });

  test("shell regression smoke: home / work / footer visible", async ({ page }) => {
    for (const path of ["/", "/work/", "/en/"]) {
      await page.setViewportSize({ width: 1440, height: 900 });
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator("nav.site-nav")).toBeVisible();
      await expect(page.locator("footer.site-footer")).toBeVisible();
      await assertNoHorizontalOverflow(page);
    }
  });
});
