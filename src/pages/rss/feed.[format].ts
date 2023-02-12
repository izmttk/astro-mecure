import type { APIRoute, GetStaticPaths } from 'astro';
import generateRssFeed from '../../utils/generateRSSFeed';

export const get: APIRoute = async ({params, site}) => {
  if (!site) {
    return { body: '' }
  }
  const format = params.format as 'xml' | 'json';
  return {
    body: await generateRssFeed({
      title: 'Title',
      description: 'Description',
      site: site.href,
      author: 'author',
      favicon: '/favicon.svg',
      format: format,
    })
  }
  // return rss({
  //   title: 'Title',
  //   description: 'A humble Astronaut’s guide to the stars',
  //   site: site?.href ?? '',
  //   items: (await getPosts()).map(post => ({
  //     title: post.title,
  //     pubDate: post.date,
  //     description: post.excerpt,
  //     draft: post.draft,
  //     // Compute RSS link from post `slug`
  //     // This example assumes all posts are rendered as `/blog/[slug]` routes
  //     link: `/blog/${post.slug}/`,
  //     content: post.raw
  //   })),
  // })
}

export const getStaticPaths: GetStaticPaths = () => {
  return [ 
    { params: { format: 'xml'} },
    { params: { format: 'json'} },
  ]
}