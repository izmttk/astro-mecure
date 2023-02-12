import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    image: z.string().optional(),
    date: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().default(false),
    author: z.string().optional(),
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

export const collections = {
  blog,
}