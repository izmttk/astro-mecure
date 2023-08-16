import type { Page } from 'astro'
import type { Paginator, Post } from '@/types'
import { url } from './url';


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
        return url(path);
      }
      return url(path, `page/${index + 1}`);
    })
  }
}