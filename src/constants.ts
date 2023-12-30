import urlJoin from 'url-join';

// vite & astro built-in
export const FS_PREFIX = '/@fs/'
export const BASE_URL = import.meta.env.BASE_URL

// assets
export const ASSETS_LIST = import.meta.glob<{ default: ImageMetadata; }>('/src/assets/*')
export const ASSETS_DIR = '/src/assets'

// content collection
export const CONTENT_DIR = '/src/content'
export const BLOG_COLLECTION_NAME = 'blog'
export const FRIENDS_COLLECTION_NAME = 'friends'
export const AUTHORS_COLLECTION_NAME = 'authors'

// constant for default vaules
export const UNCATEGOTIZED_CAT = {
  label: '未分类',
  slug: 'uncategorized',
  url: urlJoin(BASE_URL, 'categories/uncategorized'),
}