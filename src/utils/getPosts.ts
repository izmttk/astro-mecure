import type { Author, Post } from '@/types';
import config from '@/site.config';
import { type CollectionEntry, getCollection, getEntry, render } from 'astro:content';

// import { slug } from 'github-slugger';

import transformTags from './transformTags';
import transformCategory from './transformCategory';
import { url } from './url';
import getFileCommitDates from './getFileCommitDates';
import { BLOG_COLLECTION_NAME as collection } from '@/constants';

function countTags(posts: CollectionEntry<'blog'>[]) {
  const bucket = new Map<string, number>();
  posts.map(post => {
    post.data.tags.forEach(tag => {
      const tagSlug = transformTags([tag])[0].slug;
      bucket.set(tagSlug, (bucket.get(tagSlug) ?? 0) + 1);
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

let cache: Post[] | null = null;

async function getPosts(): Promise<Post[]> {
  if (cache !== null) {
    return cache;
  }
  const posts = await getCollection(collection);

  const tagsBucket = countTags(posts);
  const categoriesBucket = countCategories(posts);
  
  cache = await Promise.all(posts.map(async post => {
    const { Content, headings, remarkPluginFrontmatter } = await render(post);
    const author = (await getEntry(post.data.author)).data ?? {name: config.author};
    const gitDates = post.data.date && post.data.updateDate
      ? null
      : getFileCommitDates(post.filePath ?? `blog/posts/${post.id}`);
    const date = post.data.date ?? gitDates!.createdAt;
    const updateDate = post.data.updateDate ?? gitDates!.updatedAt;
    return {
      slug: post.data.permalink ?? post.id,
      title: post.data.title ?? '无标题',
      url: postUrl(post.id),
      author: author,
      image: post.data.image,
      date,
      updateDate,
      draft: post.data.draft,
      category: {
        ...transformCategory(post.data.category),
        count: categoriesBucket.get(post.data.category.join('/')) ?? 1
      },
      tags: transformTags(post.data.tags).map(tag => ({ 
        ...tag, 
        count: tagsBucket.get(tag.slug) ?? 1,
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
  return cache;
}

export default getPosts;
