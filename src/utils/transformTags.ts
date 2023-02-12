import { slug } from 'github-slugger';
import urlJoin from 'url-join';

function tagUrl(slug: string) {
  return urlJoin(import.meta.env.BASE_URL, 'tags', slug);
}

function transformTags(tags: string[]) {
  return tags.map(tag => ({
    label: tag,
    slug: slug(tag),
    url: tagUrl(slug(tag)),
  }))
}

export default transformTags;