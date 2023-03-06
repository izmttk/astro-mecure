import type { Page } from 'astro'
import urlJoin from 'url-join'
import type { Paginator, Post } from '@/types'


export function createPaginator(page: Page<Omit<Post, 'Content'>>, options: {
  path?: string;
  firstPageIsIndex?: boolean;
} = {}): Paginator {
  const {
    path = '',
    firstPageIsIndex = false,
  } = options;
  return {
    total: page.lastPage,
    current: page.currentPage,
    currentCount: page.size,
    totalCount: page.total,
    prev: page.currentPage - 1 >= 0 ? page.currentPage - 1 : null,
    next: page.currentPage + 1 <= page.total ? page.currentPage + 1 : null,
    pageUrls: Array(page.lastPage).fill(undefined).map((_, index) => {
      if (firstPageIsIndex && index === 0) {
        return urlJoin(import.meta.env.BASE_URL, path, '/');
      }
      return urlJoin(import.meta.env.BASE_URL, path, `page/${index + 1}`);
    })
  }
}