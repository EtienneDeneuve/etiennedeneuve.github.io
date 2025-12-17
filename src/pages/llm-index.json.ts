import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const blog = await getCollection("blog");
  const resources = await getCollection("resources");

  const baseUrl = site?.toString() ?? "https://etienne.deneuve.xyz";
  const makeUrl = (path: string) => new URL(path, baseUrl).toString();

  const items = [
    ...blog.map((post) => ({
      type: "blog" as const,
      slug: post.slug,
      url: makeUrl(`/${post.slug}`),
      title: post.data.title,
      description: post.data.description,
      pubDate:
        post.data.pubDate instanceof Date
          ? post.data.pubDate.toISOString()
          : undefined,
      lastModified:
        post.data.lastModified instanceof Date
          ? post.data.lastModified.toISOString()
          : undefined,
      minutesRead: post.data.minutesRead,
      tags: post.data.tags,
      img: post.data.img,
      img_alt: post.data.img_alt,
    })),
    ...resources.map((res) => ({
      type: "resource" as const,
      slug: res.slug,
      url: makeUrl(`/resources/${res.slug}`),
      title: res.data.title,
      description: res.data.description,
      category: res.data.category,
      tags: res.data.tags,
      pubDate:
        res.data.pubDate instanceof Date
          ? res.data.pubDate.toISOString()
          : undefined,
      externalUrl: res.data.url,
      img: res.data.img,
    })),
  ];

  const body = {
    site: baseUrl,
    generatedAt: new Date().toISOString(),
    items,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};


