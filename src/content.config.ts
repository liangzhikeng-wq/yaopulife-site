import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    price: z.string().optional(),
    category: z.string().optional(),
    material: z.string().optional(),
    size: z.string().optional(),
    time: z.string().optional(),
    customization: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});

export const collections = { blog, products };