import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      publishDate: z.date(),
      modifiedDate: z.date(),
      tags: z.array(z.string()),
      image: image(),
    }),
});

export const collections = { blog };
