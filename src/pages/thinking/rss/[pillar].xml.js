import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { thinkingConfig, thinkingPillars } from "../../../config/thinking.ts";
import { siteConfig } from "../../../config/site.ts";
import { getArticleLanguage, getArticlePath, getContentTypeLabel } from "../../../lib/thinking.ts";
import { getReleasedArticles } from "../../../lib/publication-policy.ts";

export async function getStaticPaths() {
  return thinkingPillars.map((pillar) => ({ params: { pillar } }));
}

export async function GET(context) {
  const pillar = context.params.pillar;
  if (!pillar || !(pillar in thinkingConfig.pillarLabels)) {
    return new Response("Not found", { status: 404 });
  }

  const blog = getReleasedArticles(await getCollection("blog"));
  const articles = getReleasedArticles(await getCollection("articles"));
  const merged = [...blog, ...articles].filter((entry) => entry.data.pillar === pillar);

  if (merged.length < 2) {
    return new Response("Feed not available for this pillar", { status: 404 });
  }

  const label = thinkingConfig.pillarLabels[pillar];

  return rss({
    title: `${siteConfig.identity.name} — ${label.fr}`,
    description: `Flux RSS — pilier ${label.fr}`,
    site: context.site,
    items: merged
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => {
        const lang = getArticleLanguage(post);
        return {
          title: post.data.title,
          pubDate: post.data.pubDate,
          description: post.data.description || post.data.title,
          link: getArticlePath(post.id, lang),
          categories: [getContentTypeLabel(post.data.contentType, lang)],
        };
      }),
    customData: `<language>fr-fr</language>`,
  });
}
