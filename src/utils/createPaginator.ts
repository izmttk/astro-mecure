import type { Page } from 'astro'
import type { Paginator, Post } from '@/types'
import { url } from './url';


export function createPaginator(page: Page<Omit<Post, 'Content'>>, options: {
  path?: string;
  includesFirstPageNumber?: boolean;
} = {}): Paginator {
  const {
    path = '',
    includesFirstPageNumber = false,
  } = options;
  return {
    total: page.lastPage,
    totalCount: page.total,
    current: page.currentPage,
    currentCount: page.size,
    prev: page.currentPage - 1 >= 0 ? page.currentPage - 1 : null,
    next: page.currentPage + 1 <= page.total ? page.currentPage + 1 : null,
    pageUrls: Array(page.lastPage).fill(undefined).map((_, index) => {
      if (includesFirstPageNumber && index === 0) {
        return url(path);
      }
      return url(path, `page/${index + 1}`);
    })
  }
}