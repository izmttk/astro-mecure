import usePagination from '@/hooks/usePagination';
import IconChevronLeft from '~icons/tabler/chevron-left';
import IconChevronRight from '~icons/tabler/chevron-right';
import IconChevronsLeft from '~icons/tabler/chevrons-left';
import IconChevronsRight from '~icons/tabler/chevrons-right';
import IconDots from '~icons/tabler/dots';
import { twMerge } from 'tailwind-merge';
import { forwardRef } from 'react';

export interface PaginationProps {
  className?: string;

  /** Active initial page for uncontrolled component */
  initialPage?: number;

  /** Controlled active page number */
  page?: number;

  /** Total amount of pages */
  total: number;

  /** Siblings amount on left/right side of selected page */
  siblings?: number;

  /** Amount of elements visible on left/right edges */
  boundaries?: number;

  /** Callback fired after change of each page */
  onChange?: (page: number) => void;

  /** Show/hide jump to start/end controls */
  hasEdges?: boolean;

  /** Show/hide prev/next controls */
  hasControls?: boolean;
  isLink?: boolean;
  pageUrls?: string[];
}

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(({
  className,
  page,
  total,
  onChange,
  initialPage = 1,
  siblings = 1,
  boundaries = 1,
  hasEdges = false,
  hasControls = true,
  isLink = false,
  pageUrls = [],
}, ref) => {

  if (isLink && total != pageUrls.length) {
    throw new Error('Pagination `total` must be equal to `pageUrls.length`');
  }

  const { range, setPage, next, previous, active, first, last } = usePagination({
    page,
    siblings,
    total,
    onChange,
    initialPage,
    boundaries,
  });

  if (total <= 0) {
    return null;
  }
  const itemClassName = 'rounded-md h-8 leading-8 text-center min-w-[2rem] select-none';

  const items = range.map((pageNumber, index) => (
    isLink && index < pageUrls.length && pageNumber !== 'dots' && pageNumber !== active ? (
      <a
        key={index}
        href={pageUrls[index]}
        className={twMerge(
          'cursor-pointer px-2 text-sm plate-bg plate-shadow border-highlight',
          itemClassName
        )}
        aria-current={pageNumber === active ? 'page' : undefined}
        tabIndex={0}
      >{pageNumber}</a>
    ) : (
      <div
        key={index}
        className={twMerge(
          pageNumber !== 'dots' && 'cursor-pointer px-2 text-sm',
          pageNumber !== 'dots' && pageNumber !== active && 'plate-bg plate-shadow border-highlight',
          pageNumber === active && '!bg-primary-500 text-white shadow-primary-800/50 shadow-lg',
          itemClassName
        )}
        aria-current={pageNumber === active ? 'page' : undefined}
        tabIndex={pageNumber === 'dots' ? -1 : 0}
        onClick={pageNumber !== 'dots' ? () => setPage(pageNumber) : undefined}
      >{pageNumber === 'dots' ? <IconDots className='inline' /> : pageNumber}</div>
    )
  ));

  const BtnComponent = isLink ? 'a' : 'button';
  const prevEdgeComponent = active === 1 ? (
    <div
      aria-disabled='true'
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === 1 && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronsLeft className='inline' /></div>
  ) : (
    <BtnComponent
      href={isLink && pageUrls.length ? `${pageUrls[0]}` : undefined}
      onClick={isLink ? undefined : first}
      aria-label={'first'}
      disabled={active === 1}
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === 1 && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronsLeft className='inline' /></BtnComponent>
  );
  const prevControlComponent = active === 1 ? (
    <div
      aria-disabled='true'
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === 1 && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronLeft /></div>
  ) : (
    <BtnComponent
      href={isLink && pageUrls.length && active - 2 >= 0 ? `${pageUrls[active - 2]}` : undefined}
      onClick={isLink ? undefined : previous}
      aria-label={'prev'}
      disabled={active === 1}
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === 1 && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronLeft /></BtnComponent>
  );
  const nextEdgeComponent = active === total ? (
    <div
      aria-disabled='true'
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === total && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronRight className='inline' /></div>
  ) : (
    <BtnComponent
      href={isLink && pageUrls.length && active < pageUrls.length ? `${pageUrls[active]}` : undefined}
      onClick={isLink ? undefined : next}
      aria-label={'next'}
      disabled={active === total}
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === total && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronRight className='inline' /></BtnComponent>
  );
  const nextControlComponent = active === total ? (
    <div
      aria-disabled='true'
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === total && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronsRight className='inline' /></div>
  ) : (
    <BtnComponent
      href={isLink && pageUrls.length ? `${pageUrls[pageUrls.length - 1]}` : undefined}
      onClick={isLink ? undefined : last}
      aria-label={'last'}
      disabled={active === total}
      className={twMerge(
        'plate-bg plate-shadow border-highlight cursor-pointer flex justify-center items-center',
        active === total && 'cursor-not-allowed text-disabled !shadow-none',
        itemClassName
      )}
    ><IconChevronsRight className='inline' /></BtnComponent>
  );

  return (
    <div
      className={twMerge(
        'flex gap-2',
        className
      )}
      role="navigation"
      ref={ref}
    >
      {hasEdges && prevEdgeComponent}
      {hasControls && prevControlComponent}

      {items}

      {hasControls && nextEdgeComponent}
      {hasEdges && nextControlComponent}
    </div>
  );
});


export default Pagination;