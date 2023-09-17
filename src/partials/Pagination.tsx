import Pagination, { type PaginationProps } from '@/components/Pagination'


export interface PaginationConfig extends Pick<PaginationProps, 'siblings' | 'boundaries' | 'hasEdges' | 'hasControls'> {};

export interface CustomPaginationProps {
  className?: string;
  config?: PaginationConfig,
  current?: number,
  total: number,
  pageUrls: string[]
}

export default function CustomPagination({
  className,
  config,
  current,
  total,
  pageUrls
}: CustomPaginationProps) {

  return (
    <Pagination isLink className={className} page={current} total={total} pageUrls={pageUrls} {...config} />
  )
}
