/**
 * Localize rehype-autolink-headings aria-label from article language.
 * Run after rehype-autolink-headings so FR Markdown is not announced in English.
 */
import type { Root } from "hast";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";

const LABELS = {
  fr: "Lien vers cette section",
  en: "Link to this section",
} as const;

type AstroFileData = {
  astro?: { frontmatter?: { language?: string } };
};

function detectLang(file: VFile): "fr" | "en" {
  const fm = (file.data as AstroFileData | undefined)?.astro?.frontmatter;
  if (fm?.language === "en" || fm?.language === "fr") return fm.language;
  const path = String(file.path ?? file.history?.[0] ?? "");
  if (/-en\.(md|mdx)$/i.test(path)) return "en";
  return "fr";
}

function classList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  return [];
}

export function rehypeLocalizeHeadingAnchors() {
  return (tree: Root, file: VFile) => {
    const label = LABELS[detectLang(file)];
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      if (!classList(node.properties?.className).includes("heading-anchor")) return;
      node.properties ??= {};
      node.properties.ariaLabel = label;
      // Keep anchors in the keyboard tab order (append defaults would hide them).
      delete node.properties.ariaHidden;
      if (node.properties.tabIndex === -1) delete node.properties.tabIndex;
    });
  };
}
