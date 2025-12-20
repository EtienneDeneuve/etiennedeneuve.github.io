import { defineCollection, z } from "astro:content";

const resourcesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    url: z.string().url(),
    img: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    pubDate: z.date().optional(), // Optionnel si vous voulez garder une date
  }),
});

export const blogCollections = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    minutesRead: z.string().optional(),
    tags: z.array(z.string()).optional(),
    img: z.string().optional(),
    img_alt: z.string().optional(),
  }),
});

export const collections = {
  resources: resourcesCollection,
  blog: blogCollections,
};
