import { slug } from 'github-slugger';
import { url } from './url';

function categoryUrl(slug: string) {
  return url('categories', slug);
}

const uncategorized = {
  label: '未分类',
  slug: 'uncategorized',
  url: categoryUrl('uncategorized'),
}

function transformCategory(categoryPath: string[]) {
  if (categoryPath.length === 0) {
    return uncategorized;
  }
  const categorySlug = categoryPath.map(item => slug(item)).join('/');
  return {
    label: categoryPath.join('/'),
    slug: categorySlug,
    url: categoryUrl(categorySlug),
  }
}

export default transformCategory;