import type { CollectionEntry } from "astro:content";

export type ProjectLang = "fr" | "en";

export function projectField(
  entry: CollectionEntry<"projects">,
  field: keyof CollectionEntry<"projects">["data"],
  lang: ProjectLang
): string {
  const data = entry.data;
  if (lang === "en") {
    const enKey = `${String(field)}_en` as keyof typeof data;
    const enValue = data[enKey];
    if (typeof enValue === "string" && enValue.trim()) return enValue;
  }
  const value = data[field];
  return typeof value === "string" ? value : "";
}

export function projectList(
  entry: CollectionEntry<"projects">,
  field: "decisions" | "principles" | "whatExists" | "limitations" | "learnings",
  lang: ProjectLang
): string[] {
  const data = entry.data;
  if (lang === "en") {
    const enKey = `${field}_en` as keyof typeof data;
    const enValue = data[enKey];
    if (Array.isArray(enValue) && enValue.length > 0) return enValue as string[];
  }
  return (data[field] as string[]) ?? [];
}

export function sortProjects(entries: CollectionEntry<"projects">[]) {
  return [...entries].sort((a, b) => {
    const orderDiff = (a.data.displayOrder ?? 99) - (b.data.displayOrder ?? 99);
    if (orderDiff !== 0) return orderDiff;
    return Number(b.data.featured) - Number(a.data.featured);
  });
}

export function projectEntityHref(entry: CollectionEntry<"projects">): string | undefined {
  return entry.data.website ?? entry.data.repository ?? entry.data.proofLinks[0];
}
