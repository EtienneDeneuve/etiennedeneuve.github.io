import { defineCollection, z } from "astro:content";

const resourcesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(["guide", "link", "tool", "book", "podcast", "video", "course"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    topic: z.enum([
      "DevSecOps",
      "Platform Engineering",
      "Infrastructure as Code",
      "CI/CD",
      "Cloud",
      "Security",
      "Leadership",
      "General",
      "Podcast",
      "Other"
    ]),
    category: z.string().optional(), // Keep for backward compatibility
    url: z.string().url().optional(),
    img: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
    whyItMatters: z.string().optional(),
    whenToUse: z.string().optional(),
    timeToConsume: z.string().optional(), // e.g., "15 min", "2 hours", "Ongoing"
    lastReviewed: z.coerce.date(),
    pubDate: z.date().optional(), // Keep for backward compatibility
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

const caseStudiesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    clientIndustry: z.string(),
    timeframe: z.string(),
    problem: z.string(),
    approach: z.string(),
    results: z.array(z.string()),
    metrics: z.record(z.string(), z.string()), // key-value pairs for metrics
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
    draft: z.boolean().optional().default(false),
    pubDate: z.coerce.date().optional(),
    img: z.string().optional(),
    img_alt: z.string().optional(),
  }),
});

export const collections = {
  resources: resourcesCollection,
  blog: blogCollections,
  caseStudies: caseStudiesCollection,
};
