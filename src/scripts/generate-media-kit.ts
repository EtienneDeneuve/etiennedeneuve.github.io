#!/usr/bin/env bun
/**
 * Generate media-kit.html and media-kit.pdf from the single speaking config.
 * HTML and PDF must never diverge from src/config/speaking.ts.
 *
 * Usage: pnpm run generate-media-kit
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMediaKitHtml } from "../lib/render-media-kit-html.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const publicDir = join(rootDir, "public");
const htmlPath = join(publicDir, "media-kit.html");
const pdfPath = join(publicDir, "media-kit.pdf");

async function generatePdfFromHtml(htmlFilePath: string, pdfFilePath: string): Promise<void> {
  const { chromium } = await import("playwright-core");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlFilePath}`, { waitUntil: "networkidle" });
    await page.pdf({
      path: pdfFilePath,
      format: "A4",
      printBackground: true,
      margin: { top: "2cm", right: "2cm", bottom: "2cm", left: "2cm" },
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const html = renderMediaKitHtml("fr");
  writeFileSync(htmlPath, html, "utf-8");
  console.log(`✓ Media kit HTML generated: ${htmlPath}`);

  try {
    await generatePdfFromHtml(htmlPath, pdfPath);
    console.log(`✓ Media kit PDF generated: ${pdfPath}`);
  } catch (error) {
    console.warn("⚠ PDF generation skipped — install Playwright Chromium:");
    console.warn("  npx playwright install chromium");
    console.warn(String(error));
  }
}

main();
