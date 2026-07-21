import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { thinkingConfig } from "../config/thinking.ts";
import { siteConfig } from "../config/site.ts";
import {
  getArticleLanguage,
  getArticlePath,
  getCanonicalSlug,
  getContentTypeLabel,
  getPillarLabel,
} from "../lib/thinking.ts";
import { getReleasedArticles } from "../lib/publication-policy.ts";

function mapRssItem(post) {
  const lang = getArticleLanguage(post);
  const link = getArticlePath(getCanonicalSlug(post), lang);
  return {
    title: post.data.title,
    pubDate: post.data.pubDate,
    description: post.data.description || post.data.title,
    link,
    categories: [
      getContentTypeLabel(post.data.contentType, lang),
      getPillarLabel(post.data.pillar, lang),
      lang,
    ],
    customData: [
      `<language>${lang}</language>`,
      post.data.lastModified || post.data.updateDate
        ? `<dc:date>${new Date(
            post.data.lastModified ?? post.data.updateDate
          ).toUTCString()}</dc:date>`
        : "",
    ]
      .filter(Boolean)
      .join(""),
  };
}

export async function GET(context) {
  const blog = getReleasedArticles(await getCollection("blog"));
  const articles = getReleasedArticles(await getCollection("articles"));
  const merged = [...blog, ...articles];
  const seen = new Set();
  const items = merged
    .filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map(mapRssItem);

  return rss({
    title: `${siteConfig.identity.name} — Thinking`,
    description: thinkingConfig.meta.description.fr,
    site: context.site ?? siteConfig.seo.siteUrl,
    items,
    xmlns: {
      dc: "http://purl.org/dc/elements/1.1/",
      atom: "http://www.w3.org/2005/Atom",
    },
    customData: [
      `<language>fr-fr</language>`,
      `<atom:link href="${siteConfig.seo.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />`,
    ].join(""),
  });
}
