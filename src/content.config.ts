import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const authors = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: "./blog/authors" }),
  schema: ({ image }) => z.object({
    name: z.string(),
    avatar: z.union([
      image(),
      z.string()
    ]).optional(),
    description: z.string().optional()
  })
})

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./blog/posts" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    image: z.union([
      image(),
      z.string()
    ]).optional(),
    date: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().default(false),
    author: reference('authors').default({collection: 'authors', id: 'default'}),
    tags: z.string().array().default([]),
    category: z.string().array().default([]),
    permalink: z.string().optional(),
    cardVariant: z.enum(['blur', 'material', 'full', 'plain']).default('blur')
  }).refine(
    val => val.tags.every((item, index) => val.tags.indexOf(item) === index),
    { error: 'Duplicated tags are not allowed in the same post.' }
  ),
})

export const friends = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: "./blog/friends" }),
  schema: ({ image }) => z.object({
    name: z.string(),
    link: z.url(),
    bgColor: z.string(),
    textColor: z.string(),
    avatar: z.union([
      image(),
      z.string()
    ]),
    description: z.string(),
  })
})

export const collections = {
  authors,
  blog,
  friends
}
