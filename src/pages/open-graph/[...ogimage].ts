import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import ogApi from "@thewebforge/astro-og-images";
import { siteConfig } from "../../config/site.ts";

const entries = await getCollection("blog");

export const { getStaticPaths, GET } = ogApi({
    entries: entries,
    param: "ogimage",
    template: "eCommerce",

    getImageOptions: async ({ id, data }: CollectionEntry<"blog">) => {
        let imgPath = `${siteConfig.site.url}/${data.img}`
        if (data.img?.startsWith("https://") || data.img?.startsWith("/assets/social/")) {
            imgPath = `${siteConfig.site.url}/assets/stock-1.jpg`
        }
        return {
            path: id,
            title: {
                text: data.title,
                fontSize: "43"
            },
            description: {
                text: data.description,
                fontSize: "20"
            },
            site: {
                text: new URL(siteConfig.site.url).hostname
            },
            colors: {
                brand: "#090b11",
                accent: "#14deba",
                text1: "#090b11",
                text2: "#141925",
                surface1: "#ffffff",
                surface2: "#1480de"
            },
            format: "WEBP",
            author: {
                text: siteConfig.author.name,
                color: "#1480de"
            },
            image: {
                path: imgPath
            },
            price: {
                text: "Read Now!",
                color: "#ffffff",

            }
        };
    },
});