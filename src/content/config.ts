import { z, defineCollection, reference } from 'astro:content';

export const authors = defineCollection({
  type: 'data',
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
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    image: z.union([
      image(),
      z.string()
    ]).optional(),
    date: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().default(false),
    author: reference('authors').default('default'),
    tags: z.string().array().default([]),
    category: z.string().array().default([]),
    permalink: z.string().optional(),
    cardVariant: z.enum(['blur', 'material', 'full', 'plain']).default('blur')
  }).refine(
    val => val.tags.every((item, index) => val.tags.indexOf(item) === index),
    val => ({ 
      message: `Tag "${val.tags.find((item, index) => val.tags.indexOf(item) !== index)}" is duplicated in post "${val.title}".`
    })
  ),
})

export const friends = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    name: z.string(),
    link: z.string().url(),
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