import type { Author, Post } from '@/types';
import config from '@/config';
import { CollectionEntry, getCollection, getEntry } from 'astro:content';

// import fs from 'node:fs';
// import { slug } from 'github-slugger';

import transformTags from './transformTags';
import transformCategory from './transformCategory';
import { url } from './url';


const collection = 'blog';

function getPostPath(id: string) {
  return `src/content/${collection}/${id}`;
}

function countTags(posts: CollectionEntry<'blog'>[]) {
  const bucket = new Map<string, number>();
  posts.map(post => {
    post.data.tags.forEach(tag => {
      bucket.set(tag, (bucket.get(tag) ?? 0) + 1);
    });
  })
  return bucket;
}

function countCategories(posts: CollectionEntry<'blog'>[]) {
  const bucket = new Map<string, number>();
  posts.map(post => {
    const category = post.data.category.join('/');
    bucket.set(category, (bucket.get(category) ?? 0) + 1);
  })
  return bucket;
}

function postUrl(slug: string) {
  return url('posts', slug);
}

async function getPosts(): Promise<Post[]> {
  const posts = await getCollection(collection);

  const tagsBucket = countTags(posts);
  const categoriesBucket = countCategories(posts);
  
  return Promise.all(posts.map(async post => {
    const { Content, headings, remarkPluginFrontmatter } = await post.render();
    const author = (await getEntry(post.data.author)).data ?? {name: config.author};
    // const date = post.data.date ?? fs.statSync(getPostPath(post.id)).birthtime;
    // const updateDate = post.data.updateDate ?? fs.statSync(getPostPath(post.id)).mtime;
    return {
      slug: post.data.permalink ?? post.slug,
      title: post.data.title ?? '无标题',
      url: postUrl(post.slug),
      author: author,
      image: post.data.image,
      date: post.data.date,
      updateDate: post.data.updateDate ?? post.data.date,
      draft: post.data.draft,
      category: {
        ...transformCategory(post.data.category),
        count: categoriesBucket.get(post.data.category.join('/')) ?? 1
      },
      tags: transformTags(post.data.tags).map(tag => ({ 
        ...tag, 
        count: tagsBucket.get(tag.label) ?? 1,
      })),
      cardVariant: post.data.cardVariant,
      raw: remarkPluginFrontmatter.raw,
      excerpt: remarkPluginFrontmatter.excerpt,
      readingTime: remarkPluginFrontmatter.readingTime,
      wordCount: remarkPluginFrontmatter.wordCount,
      headings: headings,
      Content: Content,
    }
  }))
}

export default getPosts;
