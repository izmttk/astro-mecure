import { slug } from 'github-slugger';
import { url } from './url';
import { UNCATEGOTIZED_CAT } from '@/constants';

function categoryUrl(slug: string) {
  return url('categories', slug);
}

function transformCategory(categoryPath: string[]) {
  if (categoryPath.length === 0) {
    return UNCATEGOTIZED_CAT;
  }
  const categorySlug = categoryPath.map(item => slug(item)).join('/');
  return {
    label: categoryPath.join('/'),
    slug: categorySlug,
    url: categoryUrl(categorySlug),
  }
}

export default transformCategory;