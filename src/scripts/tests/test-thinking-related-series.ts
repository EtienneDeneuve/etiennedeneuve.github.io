/**
 * Behaviour tests for getSeriesForArticle / getRelatedArticles.
 * Uses lightweight stubs — no astro:content runtime required.
 */
import {
  findArticleByRef,
  getArticleLanguage,
  getPrevNextArticles,
  getRelatedArticles,
  getSeriesForArticle,
  seriesStem,
  type ThinkingArticle,
} from "../../lib/thinking.ts";
import { thinkingConfig } from "../../config/thinking.ts";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function stub(
  id: string,
  opts: {
    lang?: "fr" | "en";
    pubDate?: string;
    relatedArticles?: string[];
    pillar?: string;
  } = {}
): ThinkingArticle {
  const lang = opts.lang ?? "fr";
  return {
    id,
    collection: "blog",
    data: {
      title: id,
      description: id,
      pubDate: new Date(opts.pubDate ?? "2026-09-01T00:00:00.000Z"),
      language: lang,
      contentType: "architecture-decision",
      pillar: opts.pillar ?? "observability",
      draft: false,
      relatedArticles: opts.relatedArticles ?? [],
      relatedProjects: [],
      tags: [],
      audience: [],
    },
  } as ThinkingArticle;
}

const otelIds = thinkingConfig.series.find((s) => s.id === "otel")!.articleIds;
const nixIds = thinkingConfig.series.find((s) => s.id === "nix-entra")!.articleIds;
const ciIds = thinkingConfig.series.find((s) => s.id === "ci-ia")!.articleIds;

assert(otelIds.length === 4, "otel roster is 4");
assert(nixIds.length === 5, "nix roster is 5");
assert(ciIds.length === 6, "ci roster is 6");

// --- Series: 1/N with no published neighbour still shows index/total ---
{
  const first = stub(nixIds[0]!);
  // Only episode 1 released — no next in the corpus.
  const ctx = getSeriesForArticle(first, [first]);
  assert(ctx != null, "series context for 1/N");
  assert(ctx.index === 0, "index 0 for first episode");
  assert(ctx.total === 5, "editorial total 5 even without later releases");
  assert(ctx.prev === null, "no prev on 1/N");
  assert(ctx.next === null, "no next when later episodes are unpublished");
  assert(ctx.publishedCount === 1, "publishedCount counts released same-lang only");
}

// --- Series: 2/N links only to released same-language neighbours ---
{
  const a = stub(otelIds[0]!);
  const b = stub(otelIds[1]!);
  const c = stub(otelIds[2]!);
  const ctx = getSeriesForArticle(b, [a, b, c]);
  assert(ctx != null, "series mid-episode");
  assert(ctx.index + 1 === 2 && ctx.total === 4, "2/4");
  assert(ctx.prev?.id === a.id, "prev is published 1/4");
  assert(ctx.next?.id === c.id, "next is published 3/4");
}

// --- Series: N/N has prev, never invents a following episode ---
{
  const all = otelIds.map((id) => stub(id));
  const last = all[all.length - 1]!;
  const ctx = getSeriesForArticle(last, all);
  assert(ctx != null, "series last episode");
  assert(ctx.index + 1 === ctx.total, "N/N");
  assert(ctx.next === null, "no next past the end");
  assert(ctx.prev?.id === all[all.length - 2]!.id, "prev is N-1");
}

// --- Never mix FR/EN in series neighbours ---
{
  const fr1 = stub(otelIds[0]!, { lang: "fr" });
  const en2 = stub(`${otelIds[1]}-en`, { lang: "en" });
  const fr2 = stub(otelIds[1]!, { lang: "fr" });
  // EN reader on episode 1 — only EN corpus has episode 2 translated.
  const en1 = stub(`${otelIds[0]}-en`, { lang: "en" });
  const ctxEn = getSeriesForArticle(en1, [en1, en2, fr1, fr2]);
  assert(ctxEn != null, "EN series context");
  assert(ctxEn.next?.id === en2.id, "EN next stays EN");
  assert(getArticleLanguage(ctxEn.next!) === "en", "EN next language");

  // FR reader must not jump to EN-only neighbour when FR mid is missing.
  const frOnlyFirst = getSeriesForArticle(fr1, [fr1, en2]);
  assert(frOnlyFirst != null, "FR series with EN-only sequel");
  assert(frOnlyFirst.next === null, "no silent FR→EN next");
}

// --- Future / unresolved ids never become links ---
{
  const first = stub(ciIds[0]!);
  const ctx = getSeriesForArticle(first, [first]);
  assert(ctx != null && ctx.next === null, "future CI episodes stay unlinkable");
  assert(
    findArticleByRef([first], ciIds[1]!, "fr") === undefined,
    "findArticleByRef refuses unpublished sequel"
  );
}

// --- Related: editorial only, same language, no series mates ---
{
  const otel1 = stub(otelIds[0]!, {
    relatedArticles: [otelIds[1]!, "2026-07-06-observabilite-contrat-testable"],
  });
  const otel2 = stub(otelIds[1]!);
  const extra = stub("2026-07-06-observabilite-contrat-testable");
  const related = getRelatedArticles(otel1, [otel1, otel2, extra]);
  assert(
    related.every((item) => seriesStem(item) !== otelIds[1]),
    "series mates excluded from related (chrome owns that path)"
  );
  assert(
    related.some((item) => item.id === extra.id),
    "non-series editorial related kept"
  );
}

{
  const fr = stub(otelIds[0]!, {
    lang: "fr",
    relatedArticles: [`${otelIds[1]}-en`],
  });
  const enOnly = stub(`${otelIds[1]}-en`, { lang: "en" });
  const related = getRelatedArticles(fr, [fr, enOnly]);
  assert(related.length === 0, "related never silently swaps to the other language");
}

// --- Same-pillar helper must not invent recommendations ---
{
  const a = stub("a", { pillar: "observability" });
  const b = stub("b", { pillar: "observability" });
  const nav = getPrevNextArticles(a, [a, b]);
  assert(nav.prev === null && nav.next === null, "getPrevNextArticles is inert");
}

console.log("test-thinking-related-series: ok");
