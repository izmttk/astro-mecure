import { slug } from 'github-slugger';
import { url } from './url';

function tagUrl(slug: string) {
  return url('tags', slug);
}

function transformTags(tags: string[]) {
  return tags.map(tag => ({
    label: tag,
    slug: slug(tag),
    url: tagUrl(slug(tag)),
  }))
}

export default transformTags;