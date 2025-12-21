import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { siteConfig } from "../config/site.ts";

export async function GET(context) {
  const blog = await getCollection("blog");
  return rss({
    // `<title>` field in output xml
    title: siteConfig.author.siteName,
    // `<description>` field in output xml
    description: siteConfig.site.description,
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      customData: post.data.customData,
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/[slug]` routes
      link: `${siteConfig.site.url}/${post.slug}`,
    })),
    // (optional) inject custom xml
    customData: `<language>fr-fr</language>`,
  });
}
